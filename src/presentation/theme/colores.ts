export const COLORES = {
  fondoPrincipal: '#0F1923',
  fondoSecundario: '#1A2733',
  fondoTerciario: '#243442',

  tarjeta: '#1A2733',
  tarjetaBorde: 'rgba(255, 255, 255, 0.06)',
  tarjetaSombra: 'rgba(0, 0, 0, 0.3)',

  primario: '#00D9FF',
  primarioOscuro: '#00B8D9',
  secundario: '#7C4DFF',
  acento: '#00E676',

  texto: '#ECEFF1',
  textoSecundario: '#90A4AE',
  textoClaro: '#FFFFFF',
  textoSutil: '#546E7A',

  exito: '#00E676',
  exitoFondo: 'rgba(0, 230, 118, 0.12)',
  error: '#FF5252',
  errorFondo: 'rgba(255, 82, 82, 0.12)',
  advertencia: '#FFD740',
  advertenciaFondo: 'rgba(255, 215, 64, 0.12)',
  filtrado: '#78909C',
  filtradoFondo: 'rgba(120, 144, 156, 0.12)',

  inputFondo: 'rgba(255, 255, 255, 0.05)',
  inputBorde: 'rgba(255, 255, 255, 0.1)',
  inputBordeActivo: 'rgba(0, 217, 255, 0.5)',

  switchTrackActivo: 'rgba(0, 217, 255, 0.3)',
  switchThumbActivo: '#00D9FF',
  switchTrackInactivo: 'rgba(255, 255, 255, 0.08)',
  switchThumbInactivo: '#546E7A',

  tabBarFondo: '#0F1923',
  tabBarActivo: '#00D9FF',
  tabBarInactivo: '#546E7A',

  separador: 'rgba(255, 255, 255, 0.06)',
};

export const GRADIENTES = {
  principal: ['#0F1923', '#1A2733', '#0F1923'] as const,
  header: ['#1A2733', '#243442'] as const,
  boton: ['#00D9FF', '#7C4DFF'] as const,
  botonExito: ['#00E676', '#00C853'] as const,
  botonError: ['#FF5252', '#D32F2F'] as const,
  acento: ['#7C4DFF', '#E040FB'] as const,
};

export const SOMBRAS = {
  tarjeta: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  suave: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  boton: {
    shadowColor: '#00D9FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
};

export const BORDES = {
  radio: {
    sm: 12,
    md: 16,
    lg: 20,
    xl: 28,
  },
};
