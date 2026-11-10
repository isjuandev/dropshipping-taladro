import { useState, useEffect, useRef } from 'preact/hooks';
import { configTienda, formatCOP, generarEnlaceWhatsApp } from '../../config/tienda';
import { currentPack, selectedPackId } from '../../lib/store';
import {
  clienteFormSchema,
  generarPedidoIdBogota,
  formatearCelularColombiano,
  limpiarCelularParaPayload,
} from '../../lib/pedido-schema';
import { inicializarTracking, dispararInicioCheckout, getMetaCookies } from '../../lib/tracking';

interface MunicipioItem {
  nombre: string;
  codigoDane: string;
}

interface DepartamentoData {
  departamento: string;
  municipios: MunicipioItem[];
}

const STORAGE_DRAFT_KEY = 'hexacut_pedido_draft_v1';
const STORAGE_LAST_ORDER_KEY = 'ultimo_pedido_resumen';
const TEXTO_OFICINA = 'Reclamar en oficina principal';

// Para buscar sin importar tildes ni mayúsculas ("medellin" encuentra "Medellín")
const normalizar = (texto: string) =>
  texto.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

export default function OrderForm() {
  const pack = currentPack.value;

  // Identificador de pedido generado con fecha de Bogotá, preservado en reintentos
  const [pedidoId, setPedidoId] = useState<string>('');
  const mountTimeRef = useRef<number>(Date.now());

  // Datos del formulario
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [celular, setCelular] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [codigoDane, setCodigoDane] = useState('');
  const [tipoEntrega, setTipoEntrega] = useState<'domicilio' | 'oficina'>('domicilio');
  const [direccion, setDireccion] = useState('');
  const [indicaciones, setIndicaciones] = useState('');
  const [consentimiento, setConsentimiento] = useState(false);
  const [honeypotEmpresa, setHoneypotEmpresa] = useState('');

  // Errores de validación campo a campo
  const [errores, setErrores] = useState<Record<string, string>>({});

  // Lista de departamentos y municipios (cargada dinámicamente)
  const [colombiaData, setColombiaData] = useState<DepartamentoData[]>([]);
  const [municipiosDisponibles, setMunicipiosDisponibles] = useState<MunicipioItem[]>([]);
  const [filtroCiudad, setFiltroCiudad] = useState('');
  const [mostrarDropdownCiudad, setMostrarDropdownCiudad] = useState(false);

  // Estados de envío y respuesta
  const [enviando, setEnviando] = useState(false);
  const [mensajeEstado, setMensajeEstado] = useState<{
    tipo: 'duplicado' | 'rate-limit' | 'no-disponible' | 'error-red' | null;
    texto: string;
  }>({ tipo: null, texto: '' });

  // Temporizador para error 429
  const [segundosCooldown, setSegundosCooldown] = useState(0);

  // Referencias a los inputs para enfocar el primer error
  const inputRefs = {
    nombreCompleto: useRef<HTMLInputElement>(null),
    celular: useRef<HTMLInputElement>(null),
    departamento: useRef<HTMLSelectElement>(null),
    ciudad: useRef<HTMLInputElement>(null),
    direccion: useRef<HTMLInputElement>(null),
    consentimiento: useRef<HTMLInputElement>(null),
  };

  // Inicialización en cliente
  useEffect(() => {
    setPedidoId(generarPedidoIdBogota());
    mountTimeRef.current = Date.now();
    inicializarTracking();

    // Cargar datos DIVIPOLA DANE dinámicamente con códigos DANE
    import('../../data/colombia.json')
      .then((mod) => {
        const datos = (mod.default || mod) as DepartamentoData[];
        setColombiaData(datos);
      })
      .catch((err) => {
        console.error('Error cargando catálogo de Colombia:', err);
      });
  }, []);

  // Actualizar lista de municipios al cambiar departamento
  useEffect(() => {
    if (!departamento || colombiaData.length === 0) {
      setMunicipiosDisponibles([]);
      return;
    }
    const dptoEncontrado = colombiaData.find(
      (item) => normalizar(item.departamento) === normalizar(departamento)
    );
    if (dptoEncontrado && Array.isArray(dptoEncontrado.municipios)) {
      setMunicipiosDisponibles(dptoEncontrado.municipios);
      // Si la ciudad actual no pertenece al departamento, resetearla
      const existeCiudad = dptoEncontrado.municipios.some(
        (m) => normalizar(m.nombre) === normalizar(ciudad)
      );
      if (ciudad && !existeCiudad) {
        setCiudad('');
        setCodigoDane('');
        setFiltroCiudad('');
      }
    } else {
      setMunicipiosDisponibles([]);
    }
  }, [departamento, colombiaData]);

  // Persistir borrador al escribir
  const guardarBorrador = (datos: Record<string, any>) => {
    try {
      const actual = {
        nombreCompleto,
        celular,
        departamento,
        ciudad,
        codigoDane,
        tipoEntrega,
        direccion,
        indicaciones,
        ...datos,
      };
      localStorage.setItem(STORAGE_DRAFT_KEY, JSON.stringify(actual));
    } catch (e) {}
  };

  // Manejador del cambio entre Entrega a Domicilio y Recoger en Oficina
  const handleTipoEntregaChange = (tipo: 'domicilio' | 'oficina') => {
    setTipoEntrega(tipo);
    if (tipo === 'oficina') {
      if (!direccion || direccion.trim() === '') {
        setDireccion(TEXTO_OFICINA);
        guardarBorrador({ tipoEntrega: tipo, direccion: TEXTO_OFICINA });
      } else {
        guardarBorrador({ tipoEntrega: tipo });
      }
    } else {
      if (direccion === TEXTO_OFICINA) {
        setDireccion('');
        guardarBorrador({ tipoEntrega: tipo, direccion: '' });
      } else {
        guardarBorrador({ tipoEntrega: tipo });
      }
    }
  };

  // Cuenta regresiva para 429
  useEffect(() => {
    if (segundosCooldown <= 0) return;
    const interval = setInterval(() => {
      setSegundosCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setMensajeEstado({ tipo: null, texto: '' });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [segundosCooldown]);

  // Manejador del primer foco: dispara begin_checkout
  const handlePrimerFoco = () => {
    dispararInicioCheckout(pack.precio);
  };

  // Validación individual al desenfocar campo (onBlur)
  const validarCampo = (campo: string) => {
    const datosValidar = {
      nombreCompleto,
      celular,
      departamento,
      ciudad,
      codigoDane: codigoDane || '00000',
      tipoEntrega,
      direccion,
      indicaciones,
      consentimiento,
    };

    const resultado = clienteFormSchema.safeParse(datosValidar);
    if (!resultado.success) {
      const errorCampo = resultado.error.issues.find((issue) => issue.path[0] === campo);
      if (errorCampo) {
        setErrores((prev) => ({ ...prev, [campo]: errorCampo.message }));
        return;
      }
    }
    // Si no hay error en este campo, limpiarlo
    setErrores((prev) => {
      const nuevo = { ...prev };
      delete nuevo[campo];
      return nuevo;
    });
  };

  // Manejo de envío del pedido a NexoBite API
  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    // 1. Antispam: Honeypot
    if (honeypotEmpresa.trim().length > 0) {
      console.warn('Bot detectado por honeypot');
      return;
    }

    // 2. Antispam: Tiempo mínimo de 5 segundos
    const segundosTranscurridos = Math.floor((Date.now() - mountTimeRef.current) / 1000);
    if (segundosTranscurridos < 5) {
      setMensajeEstado({
        tipo: 'error-red',
        texto: 'Por favor tómate un momento para revisar que tus datos estén completos antes de confirmar.',
      });
      return;
    }

    // 3. Validación Zod en cliente
    const datosCliente = {
      nombreCompleto,
      celular,
      departamento,
      ciudad,
      codigoDane: codigoDane || '00000',
      tipoEntrega,
      direccion,
      indicaciones,
      consentimiento,
    };

    const parsed = clienteFormSchema.safeParse(datosCliente);
    if (!parsed.success) {
      const nuevosErrores: Record<string, string> = {};
      let primerCampoConError = '';

      parsed.error.issues.forEach((issue) => {
        const nombreCampo = String(issue.path[0]);
        if (!nuevosErrores[nombreCampo]) {
          nuevosErrores[nombreCampo] = issue.message;
        }
        if (!primerCampoConError && nombreCampo in inputRefs) {
          primerCampoConError = nombreCampo;
        }
      });

      setErrores(nuevosErrores);

      if (primerCampoConError) {
        const refObj = (inputRefs as Record<string, { current: HTMLElement | null }>)[primerCampoConError];
        if (refObj?.current) {
          refObj.current.focus();
        }
      }
      return;
    }

    setErrores({});
    setEnviando(true);
    setMensajeEstado({ tipo: null, texto: '' });

    // 4. Preparar Payload del contrato público de NexoBite Leads
    const tracking = inicializarTracking();
    const metaCookies = getMetaCookies(tracking.fbclid);

    const apiUrl = configTienda.pedido.endpoint;
    const productId = configTienda.pedido.productId;
    const campaignSlug = configTienda.pedido.campaignSlug;

    const landingUrl = typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : 'https://viraly.shop/cortador-lamina-taladro';

    const textoIndicaciones = [
      parsed.data.indicaciones?.trim(),
      tipoEntrega === 'oficina' ? '[RECOGER EN OFICINA PRINCIPAL]' : '',
    ]
      .filter(Boolean)
      .join(' · ');

    const nexoPayload = {
      pedidoId,
      fecha: new Date().toISOString(),
      tienda: configTienda.nombreTienda,
      landing: landingUrl,
      campaignSlug,
      producto: {
        providerProductId: String(productId),
        nombre: `${configTienda.producto.nombre} · ${pack.nombre}`,
        variante: configTienda.producto.variante,
        paquete: pack.nombre,
        cantidad: pack.unidades,
        extras: configTienda.producto.incluyeRepuesto ? ['Ruedas de repuesto'] : [],
        precioUnitario: pack.precioUnitario,
        total: pack.precio,
      },
      cliente: {
        nombreCompleto: parsed.data.nombreCompleto,
        celular: limpiarCelularParaPayload(parsed.data.celular),
        departamento: parsed.data.departamento,
        ciudad: parsed.data.ciudad,
        direccion: parsed.data.direccion,
        indicaciones: textoIndicaciones,
      },
      consentimiento: true as const,
      origen: {
        utm_source: tracking.utm_source || '',
        utm_medium: tracking.utm_medium || '',
        utm_campaign: tracking.utm_campaign || '',
        utm_content: tracking.utm_content || '',
        fbclid: tracking.fbclid || '',
        referrer: tracking.referrer || '',
        fbp: tracking.fbp || metaCookies.fbp || '',
        fbc: tracking.fbc || metaCookies.fbc || '',
      },
      antispam: {
        empresa: '',
        segundos: segundosTranscurridos,
      },
    };

    // 5. Envío mediante Fetch POST con timeout de 15 segundos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(nexoPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const json = await res.json().catch(() => ({}));

      // A) Éxito HTTP 200 o 201
      if (res.status === 200 || res.status === 201) {
        if (json?.data?.duplicate) {
          // Caso duplicado devuelto por la API
          setEnviando(false);
          setMensajeEstado({
            tipo: 'duplicado',
            texto: 'Ya tienes un pedido en curso con estos datos. Te contactaremos pronto para confirmarlo.',
          });
          return;
        }

        // Éxito confirmado: guardar resumen y limpiar borrador
        try {
          localStorage.removeItem(STORAGE_DRAFT_KEY);
          const resumen = {
            pedidoId,
            orderId: json?.data?.orderId || pedidoId,
            pack: pack.nombre,
            total: pack.precio,
            clienteNombre: parsed.data.nombreCompleto,
            ciudad: parsed.data.ciudad,
            departamento: parsed.data.departamento,
            codigoDane: codigoDane || '00000',
            tipoEntrega,
            direccion: parsed.data.direccion,
          };
          localStorage.setItem(STORAGE_LAST_ORDER_KEY, JSON.stringify(resumen));
          sessionStorage.setItem(STORAGE_LAST_ORDER_KEY, JSON.stringify(resumen));
          localStorage.setItem('ultimo_pedido_resumen_backup', JSON.stringify(resumen));
        } catch (e) {}

        // Redirección inmediata a /gracias
        window.location.href = `/gracias?id=${encodeURIComponent(pedidoId)}`;
        return;
      }

      // B) Rate-limit 429
      if (res.status === 429) {
        setEnviando(false);
        setSegundosCooldown(60);
        setMensajeEstado({
          tipo: 'rate-limit',
          texto: 'Recibimos varios intentos seguidos. Espera un minuto e inténtalo de nuevo.',
        });
        return;
      }

      // C) Producto no disponible 404 o 422
      if (res.status === 404 || res.status === 422) {
        setEnviando(false);
        setMensajeEstado({
          tipo: 'no-disponible',
          texto: 'Este producto no está disponible en este momento. Escríbenos por WhatsApp para asistirte.',
        });
        return;
      }

      // D) Otros errores HTTP
      const apiMsg = typeof json?.message === 'string' ? json.message : '';
      throw new Error(apiMsg || `Error de servidor (${res.status})`);
    } catch (err: any) {
      clearTimeout(timeoutId);
      setEnviando(false);

      if (err.name === 'AbortError') {
        setMensajeEstado({
          tipo: 'error-red',
          texto: 'La solicitud tardó demasiado tiempo. Revisa tu conexión a internet e inténtalo de nuevo.',
        });
      } else {
        setMensajeEstado({
          tipo: 'error-red',
          texto: err?.message || 'No pudimos enviar tu pedido. Revisa tu conexión e inténtalo de nuevo.',
        });
      }
    }
  };

  const enlaceSoporte = generarEnlaceWhatsApp({
    pedidoId,
    producto: configTienda.producto.nombre,
    pack: pack.nombre,
    total: pack.precio,
  });

  const enlaceDudas = generarEnlaceWhatsApp({
    mensajePersonalizado: `Hola ${configTienda.nombreTienda}, tengo una duda antes de confirmar mi pedido de Cortadora de Lámina:`,
  });

  const ciudadesFiltradas = municipiosDisponibles.filter((m) =>
    normalizar(m.nombre).includes(normalizar(filtroCiudad))
  );

  return (
    <div class="w-full max-w-2xl mx-auto bg-[var(--color-hierro)] border border-gray-700/80 rounded-[14px] p-6 md:p-8 shadow-2xl relative">
      {/* Encabezado del Formulario */}
      <div class="text-center pb-6 border-b border-gray-700/60">
        <span class="inline-block px-3 py-1 rounded-full bg-[var(--color-naranja)]/15 text-[var(--color-naranja)] text-xs font-bold uppercase tracking-widest font-['Barlow_Condensed']">
          PEDIDO CONTRAENTREGA
        </span>
        <h2 class="text-3xl md:text-4xl font-extrabold text-white uppercase font-['Barlow_Condensed'] tracking-wide mt-2">
          Confirma tu pedido
        </h2>
        <p class="text-sm text-gray-300 mt-1 max-w-md mx-auto">
          Confirmamos el pedido contigo antes de despachar. Pagas en efectivo cuando el transportador te entregue.
        </p>
      </div>

      {/* Resumen en Vivo del Pack Seleccionado */}
      <div class="mt-6 p-4 rounded-xl bg-[var(--color-acero)] border border-gray-700 flex items-center justify-between gap-3">
        <div>
          <div class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Resumen de tu compra:
          </div>
          <div class="text-base font-bold text-white font-['Barlow_Condensed'] uppercase tracking-wide">
            {configTienda.producto.nombre} · {pack.nombre}
          </div>
          <div class="text-xs text-[var(--color-chispa)] font-medium">
            {pack.unidades} unidad(es) · Despacho gratis a domicilio
          </div>
        </div>

        <div class="text-right shrink-0">
          <div class="text-[10px] text-gray-400 uppercase">Pagas al recibir:</div>
          <div class="text-xl md:text-2xl font-black text-white font-mono nums-tabular">
            {formatCOP(pack.precio)}
          </div>
        </div>
      </div>

      {/* Cambiar de opción sin salir del formulario */}
      <div class="mt-3 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Elige cuántas unidades quieres">
        {configTienda.packs.map((p) => {
          const activo = p.id === pack.id;
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={activo}
              onClick={() => {
                selectedPackId.value = p.id;
              }}
              class={`min-h-12 px-3 py-2 rounded-lg border text-left transition-colors cursor-pointer ${
                activo
                  ? 'bg-[var(--color-acero)] border-[var(--color-naranja)] ring-1 ring-[var(--color-naranja)]'
                  : 'bg-transparent border-gray-700 hover:border-gray-500'
              }`}
            >
              <span class="block text-sm font-bold text-white font-['Barlow_Condensed'] uppercase tracking-wide">
                {p.unidades} {p.unidades === 1 ? 'unidad' : 'unidades'}
              </span>
              <span class="block text-xs text-gray-300 font-mono nums-tabular">
                {formatCOP(p.precio)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Formulario de Orden */}
      <form onSubmit={handleSubmit} noValidate autoComplete="off" class="mt-6 space-y-4">
        {/* Honeypot invisible */}
        <div style={{ display: 'none' }} aria-hidden="true">
          <label for="empresa">Empresa</label>
          <input
            id="empresa"
            type="text"
            name="empresa"
            value={honeypotEmpresa}
            onInput={(e) => setHoneypotEmpresa((e.target as HTMLInputElement).value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* 1. Nombre Completo */}
        <div>
          <label for="campo-nombre" class="block text-xs font-bold text-gray-300 uppercase tracking-wide mb-1.5">
            Nombre y Apellido <span class="text-[var(--color-naranja)]">*</span>
          </label>
          <input
            ref={inputRefs.nombreCompleto}
            id="campo-nombre"
            type="text"
            name="nombreCompleto"
            value={nombreCompleto}
            placeholder="Ej. Juan Fernando Pérez"
            autoComplete="off"
            onFocus={handlePrimerFoco}
            onInput={(e) => {
              const val = (e.target as HTMLInputElement).value;
              setNombreCompleto(val);
              guardarBorrador({ nombreCompleto: val });
            }}
            onBlur={() => validarCampo('nombreCompleto')}
            aria-invalid={Boolean(errores.nombreCompleto)}
            aria-describedby={errores.nombreCompleto ? 'err-nombre' : undefined}
            class={`w-full h-12 px-3.5 rounded-lg bg-[var(--color-acero)] text-white placeholder-gray-500 border transition-all outline-none focus:ring-2 focus:ring-[var(--color-naranja)] ${
              errores.nombreCompleto ? 'border-[var(--color-alerta)]' : 'border-gray-700'
            }`}
          />
          {errores.nombreCompleto && (
            <p id="err-nombre" class="mt-1 text-xs text-[var(--color-alerta)] flex items-center gap-1 font-medium">
              <svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {errores.nombreCompleto}
            </p>
          )}
        </div>

        {/* 2. Celular */}
        <div>
          <label for="campo-celular" class="block text-xs font-bold text-gray-300 uppercase tracking-wide mb-1.5">
            Celular (WhatsApp para coordinar entrega) <span class="text-[var(--color-naranja)]">*</span>
          </label>
          <div class="relative">
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">
              +57
            </span>
            <input
              ref={inputRefs.celular}
              id="campo-celular"
              type="tel"
              name="celular"
              value={formatearCelularColombiano(celular)}
              placeholder="300 123 4567"
              autoComplete="off"
              onFocus={handlePrimerFoco}
              onInput={(e) => {
                const val = (e.target as HTMLInputElement).value;
                const formateado = formatearCelularColombiano(val);
                setCelular(formateado);
                guardarBorrador({ celular: formateado });
              }}
              onBlur={() => validarCampo('celular')}
              aria-invalid={Boolean(errores.celular)}
              aria-describedby={errores.celular ? 'err-celular' : undefined}
              class={`w-full h-12 pl-12 pr-3.5 rounded-lg bg-[var(--color-acero)] text-white placeholder-gray-500 border transition-all outline-none focus:ring-2 focus:ring-[var(--color-naranja)] font-mono nums-tabular ${
                errores.celular ? 'border-[var(--color-alerta)]' : 'border-gray-700'
              }`}
            />
          </div>
          {errores.celular && (
            <p id="err-celular" class="mt-1 text-xs text-[var(--color-alerta)] flex items-center gap-1 font-medium">
              <svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {errores.celular}
            </p>
          )}
        </div>

        {/* 3. Departamento y Ciudad en dos columnas */}
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Departamento */}
          <div>
            <label for="campo-departamento" class="block text-xs font-bold text-gray-300 uppercase tracking-wide mb-1.5">
              Departamento <span class="text-[var(--color-naranja)]">*</span>
            </label>
            <select
              ref={inputRefs.departamento}
              id="campo-departamento"
              name="departamento"
              autoComplete="off"
              value={departamento}
              onChange={(e) => {
                const val = (e.target as HTMLSelectElement).value;
                setDepartamento(val);
                setCiudad('');
                setCodigoDane('');
                setFiltroCiudad('');
                guardarBorrador({ departamento: val, ciudad: '', codigoDane: '' });
              }}
              onBlur={() => validarCampo('departamento')}
              aria-invalid={Boolean(errores.departamento)}
              aria-describedby={errores.departamento ? 'err-depto' : undefined}
              class={`w-full h-12 px-3 rounded-lg bg-[var(--color-acero)] text-white border transition-all outline-none focus:ring-2 focus:ring-[var(--color-naranja)] cursor-pointer ${
                errores.departamento ? 'border-[var(--color-alerta)]' : 'border-gray-700'
              }`}
            >
              <option value="">Selecciona tu departamento</option>
              {colombiaData.map((dpto) => (
                <option key={dpto.departamento} value={dpto.departamento}>
                  {dpto.departamento}
                </option>
              ))}
            </select>
            {errores.departamento && (
              <p id="err-depto" class="mt-1 text-xs text-[var(--color-alerta)] flex items-center gap-1 font-medium">
                {errores.departamento}
              </p>
            )}
          </div>

          {/* Ciudad o Municipio (Combobox con filtro y DANE) */}
          <div class="relative">
            <label for="campo-ciudad" class="block text-xs font-bold text-gray-300 uppercase tracking-wide mb-1.5 flex items-center justify-between">
              <span>Ciudad o Municipio <span class="text-[var(--color-naranja)]">*</span></span>
              {codigoDane && (
                <span class="text-[10px] text-gray-400 font-mono">DANE {codigoDane}</span>
              )}
            </label>
            <input
              ref={inputRefs.ciudad}
              id="campo-ciudad"
              type="text"
              name="ciudad"
              autoComplete="off"
              disabled={!departamento}
              placeholder={departamento ? 'Escribe o elige tu municipio' : 'Elige departamento primero'}
              value={ciudad || filtroCiudad}
              onFocus={() => {
                if (departamento) setMostrarDropdownCiudad(true);
              }}
              onInput={(e) => {
                const val = (e.target as HTMLInputElement).value;
                setFiltroCiudad(val);
                setCiudad(val);
                setCodigoDane('');
                setMostrarDropdownCiudad(true);
                guardarBorrador({ ciudad: val, codigoDane: '' });
              }}
              onBlur={() => {
                setTimeout(() => {
                  setMostrarDropdownCiudad(false);
                  validarCampo('ciudad');
                }, 200);
              }}
              aria-invalid={Boolean(errores.ciudad)}
              aria-describedby={errores.ciudad ? 'err-ciudad' : undefined}
              class={`w-full h-12 px-3.5 rounded-lg bg-[var(--color-acero)] text-white placeholder-gray-500 border transition-all outline-none focus:ring-2 focus:ring-[var(--color-naranja)] disabled:opacity-50 disabled:cursor-not-allowed ${
                errores.ciudad ? 'border-[var(--color-alerta)]' : 'border-gray-700'
              }`}
            />

            {/* Dropdown de opciones filtradas con código DANE */}
            {mostrarDropdownCiudad && departamento && (
              <ul class="absolute z-30 left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded-lg bg-[var(--color-acero)] border border-gray-600 shadow-xl py-1 text-sm divide-y divide-gray-700/50">
                {ciudadesFiltradas.length > 0 ? (
                  ciudadesFiltradas.map((m) => (
                    <li
                      key={m.codigoDane || m.nombre}
                      onMouseDown={() => {
                        setCiudad(m.nombre);
                        setCodigoDane(m.codigoDane);
                        setFiltroCiudad('');
                        setMostrarDropdownCiudad(false);
                        guardarBorrador({ ciudad: m.nombre, codigoDane: m.codigoDane });
                      }}
                      class="px-3.5 py-2.5 hover:bg-[var(--color-hierro)] text-white cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <span class="font-medium">{m.nombre}</span>
                      <span class="text-[11px] text-gray-400 font-mono">DANE {m.codigoDane}</span>
                    </li>
                  ))
                ) : (
                  <li class="px-3.5 py-2 text-gray-400 text-xs italic">
                    No encontramos "{filtroCiudad}". Puedes escribirlo directamente.
                  </li>
                )}
              </ul>
            )}

            {errores.ciudad && (
              <p id="err-ciudad" class="mt-1 text-xs text-[var(--color-alerta)] flex items-center gap-1 font-medium">
                {errores.ciudad}
              </p>
            )}
          </div>
        </div>

        {/* 4. Selector Modo de Entrega: A Domicilio vs Recoger en Oficina */}
        <div>
          <label class="block text-xs font-bold text-gray-300 uppercase tracking-wide mb-1.5">
            Modo de Entrega
          </label>
          <div class="grid grid-cols-2 gap-2 p-1 bg-[var(--color-acero)] rounded-lg border border-gray-700">
            <button
              type="button"
              onClick={() => handleTipoEntregaChange('domicilio')}
              class={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-xs font-bold transition-all cursor-pointer ${
                tipoEntrega === 'domicilio'
                  ? 'bg-[var(--color-naranja)] text-white shadow font-extrabold'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <span>A Domicilio</span>
            </button>
            <button
              type="button"
              onClick={() => handleTipoEntregaChange('oficina')}
              class={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-xs font-bold transition-all cursor-pointer ${
                tipoEntrega === 'oficina'
                  ? 'bg-[var(--color-naranja)] text-white shadow font-extrabold'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <span>Recoger en Oficina</span>
            </button>
          </div>
        </div>

        {/* 5. Dirección de Entrega o Punto de Recogida */}
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label for="campo-direccion" class="block text-xs font-bold text-gray-300 uppercase tracking-wide">
              {tipoEntrega === 'domicilio' ? 'Dirección Exacta de Entrega' : 'Punto de Recogida en Oficina'}{' '}
              <span class="text-[var(--color-naranja)]">*</span>
            </label>
            {tipoEntrega === 'domicilio' && (
              <span class="text-[11px] text-gray-400">Casa, trabajo, vereda o punto conocido</span>
            )}
          </div>
          <input
            ref={inputRefs.direccion}
            id="campo-direccion"
            type="text"
            name="direccion"
            value={direccion}
            placeholder={
              tipoEntrega === 'domicilio'
                ? 'Ej: Calle 45 # 12-30, apto 302, barrio La Floresta'
                : TEXTO_OFICINA
            }
            autoComplete="off"
            onInput={(e) => {
              const val = (e.target as HTMLInputElement).value;
              setDireccion(val);
              guardarBorrador({ direccion: val });
            }}
            onBlur={() => validarCampo('direccion')}
            aria-invalid={Boolean(errores.direccion)}
            aria-describedby={errores.direccion ? 'err-dir' : undefined}
            class={`w-full h-12 px-3.5 rounded-lg bg-[var(--color-acero)] text-white placeholder-gray-500 border transition-all outline-none focus:ring-2 focus:ring-[var(--color-naranja)] ${
              errores.direccion ? 'border-[var(--color-alerta)]' : 'border-gray-700'
            }`}
          />
          {errores.direccion && (
            <p id="err-dir" class="mt-1 text-xs text-[var(--color-alerta)] flex items-center gap-1 font-medium">
              <svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {errores.direccion}
            </p>
          )}

          {/* Aviso informativo cuando se escoge Oficina */}
          {tipoEntrega === 'oficina' && (
            <div class="mt-2.5 p-3 rounded-lg bg-[var(--color-acero)] border border-[var(--color-naranja)]/40 text-xs text-gray-200 flex items-start gap-2.5">
              <div class="space-y-0.5">
                <p class="font-bold text-white">Pagas en efectivo al retirar tu paquete</p>
                <p class="text-[11px] text-gray-300 leading-relaxed">
                  El paquete llegará a la oficina o agencia principal de transportadora en tu ciudad. Te enviaremos la guía por WhatsApp para que lo retires y pagues contraentrega.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 6. Indicaciones Adicionales (Opcional) */}
        <div>
          <label for="campo-indicaciones" class="block text-xs font-bold text-gray-300 uppercase tracking-wide mb-1.5">
            Indicaciones Adicionales para el Domiciliario (Opcional)
          </label>
          <input
            id="campo-indicaciones"
            type="text"
            name="indicaciones"
            value={indicaciones}
            maxLength={300}
            autoComplete="off"
            placeholder="Ej: Casa esquinera frente al parque / Dejar en portería"
            onInput={(e) => {
              const val = (e.target as HTMLInputElement).value;
              setIndicaciones(val);
              guardarBorrador({ indicaciones: val });
            }}
            class="w-full h-12 px-3.5 rounded-lg bg-[var(--color-acero)] text-white placeholder-gray-500 border border-gray-700 transition-all outline-none focus:ring-2 focus:ring-[var(--color-naranja)]"
          />
        </div>

        {/* 7. Casilla de Consentimiento Obligatoria */}
        <div class="pt-2">
          <label class="flex items-start gap-3 cursor-pointer group">
            <input
              ref={inputRefs.consentimiento}
              type="checkbox"
              checked={consentimiento}
              onChange={(e) => {
                const val = (e.target as HTMLInputElement).checked;
                setConsentimiento(val);
                if (val && errores.consentimiento) {
                  setErrores((prev) => {
                    const n = { ...prev };
                    delete n.consentimiento;
                    return n;
                  });
                }
              }}
              class="w-5 h-5 rounded mt-0.5 accent-[var(--color-naranja)] bg-[var(--color-acero)] border-gray-600 focus:ring-2 focus:ring-[var(--color-naranja)] cursor-pointer"
            />
            <span class="text-xs text-gray-300 leading-snug select-none">
              Autorizo el tratamiento de mis datos para gestionar mi pedido conforme a la{' '}
              <a
                href="/privacidad"
                target="_blank"
                rel="noopener"
                class="text-[var(--color-naranja)] underline hover:text-[var(--color-naranja-hover)]"
              >
                Política de Privacidad
              </a>{' '}
              (Ley 1581 de 2012).
            </span>
          </label>
          {errores.consentimiento && (
            <p class="mt-1 text-xs text-[var(--color-alerta)] flex items-center gap-1 font-medium pl-8">
              {errores.consentimiento}
            </p>
          )}
        </div>

        {/* Mensajes de Alerta y Estado */}
        {mensajeEstado.tipo && (
          <div
            class={`p-4 rounded-xl border text-sm mt-3 ${
              mensajeEstado.tipo === 'duplicado'
                ? 'bg-amber-950/40 border-amber-500 text-amber-200'
                : mensajeEstado.tipo === 'rate-limit'
                ? 'bg-orange-950/40 border-orange-500 text-orange-200'
                : 'bg-red-950/40 border-[var(--color-alerta)] text-red-200'
            }`}
          >
            <div class="flex items-start gap-2.5">
              <svg class="w-5 h-5 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div>
                <p class="font-medium">{mensajeEstado.texto}</p>
                {segundosCooldown > 0 && (
                  <p class="text-xs mt-1 font-mono">
                    Tiempo de espera: {segundosCooldown} segundos restantes.
                  </p>
                )}
                {/* Enlace de WhatsApp en error o no disponible */}
                {(mensajeEstado.tipo === 'error-red' || mensajeEstado.tipo === 'no-disponible') && (
                  <div class="mt-3 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      class="px-4 py-1.5 rounded bg-[var(--color-naranja)] text-[var(--color-tinta)] font-bold text-xs uppercase font-['Barlow_Condensed'] tracking-wide hover:bg-[var(--color-naranja-hover)]"
                    >
                      Reintentar pedido
                    </button>
                    <a
                      href={enlaceSoporte}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-xs text-white underline hover:text-[var(--color-naranja)] flex items-center gap-1"
                    >
                      <span>Hablar con un asesor por WhatsApp</span>
                    </a>
                  </div>
                )}
                {mensajeEstado.tipo === 'duplicado' && (
                  <a
                    href={enlaceSoporte}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="mt-3 inline-block text-xs text-white underline hover:text-[var(--color-naranja)]"
                  >
                    Hablar con un asesor por WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Botón de Confirmación Principal */}
        <div class="pt-4">
          <button
            type="submit"
            disabled={enviando || segundosCooldown > 0}
            class="w-full h-14 bg-[var(--color-naranja)] hover:bg-[var(--color-naranja-hover)] active:translate-y-0.5 text-[var(--color-tinta)] font-bold text-xl rounded-[10px] uppercase font-['Barlow_Condensed'] tracking-wider shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {enviando ? (
              <span class="flex items-center gap-2">
                <svg class="animate-spin w-5 h-5 text-[var(--color-tinta)]" viewBox="0 0 24 24" fill="none">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Enviando tu pedido…</span>
              </span>
            ) : segundosCooldown > 0 ? (
              <span>Espera {segundosCooldown}s para reintentar</span>
            ) : (
              <span>Confirmar mi pedido contraentrega</span>
            )}
          </button>

          <p class="mt-3 text-[11px] text-gray-400 text-center leading-relaxed">
            Al enviar tus datos aceptas que te escribamos o te llamemos para confirmar el pedido.
            No hacemos cobros automáticos ni guardamos datos de pago.
          </p>
          <p class="mt-2 text-center text-xs">
            <a
              href={enlaceDudas}
              target="_blank"
              rel="noopener noreferrer"
              class="text-white underline hover:text-[var(--color-naranja)]"
            >
              ¿Tienes dudas? Escríbenos por WhatsApp
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
