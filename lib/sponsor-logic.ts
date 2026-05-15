export interface SponsorAttributes {
  finances: number;
  expectations: number;
  patience: number;
  reputation: number;
  image: number;
  negotiation: number;
}

export interface SponsorAnswer {
  questionNumber: number;
  question: string;
  answer: string;
  answer2?: string;
  note?: string;
  note2?: string;
  attribute: string;
}

const Q1_PLACEMENT: Record<number, { spot: string; tier: string }> = {
  6: { spot: 'Tapa de motor', tier: 'La más alta' },
  5: { spot: 'Tapa de motor', tier: 'Alta' },
  4: { spot: 'Pontones', tier: 'Medio alta' },
  3: { spot: 'Pontones', tier: 'Media' },
  2: { spot: 'Trompa', tier: 'Medio baja' },
  1: { spot: 'Alerón trasero', tier: 'Baja' },
  0: { spot: 'Alerón delantero', tier: 'La más baja' },
};

const Q2_GOAL: Record<number, string> = {
  6: 'Ascenso/Promoción/Primeros 4',
  5: 'Ascenso/Promoción/Primeros 4',
  4: 'Ascenso/Promoción/Primeros 4',
  3: 'Mitad de grupo/mitad de tabla',
  2: 'Posición baja en la tabla',
  1: 'Posición baja en la tabla',
  0: 'Descender con dinero en efectivo',
};

interface Q4Result { answer: string; note: string; note2?: string }
const Q4_AMOUNT: Record<number, Q4Result> = {
  6: { answer: 'INACEPTABLE', note: '100% de probabilidad de aumento', note2: 'También posible: 50% de probabilidad de aumento' },
  5: { answer: 'INACEPTABLE', note: '50% de probabilidad de aumento' },
  4: { answer: 'Demasiado baja', note: '100% de probabilidad de aumento' },
  3: { answer: 'Demasiado baja', note: '50% de probabilidad de aumento' },
  2: { answer: 'Un poco/demasiado bajo', note: '100% de probabilidad de aumento' },
  1: { answer: 'Un poco/demasiado bajo', note: '50% de probabilidad de aumento' },
  0: { answer: 'OK/Estoy de acuerdo', note: 'No aumenta la oferta' },
};

interface Q5Result { answer: string; answer2?: string; note: string }
const Q5_DURATION: Record<number, Q5Result> = {
  6: { answer: 'Demasiado largo/corto', note: '100% cambia la duración' },
  5: { answer: 'Demasiado corto/bajo', answer2: 'Demasiado largo/alto', note: '50%/50% — puede ir en cualquier dirección' },
  4: { answer: 'Un poco corto/bajo', answer2: 'Un poco largo/alto', note: '100% cambia en alguna dirección' },
  3: { answer: 'Un poco corto/bajo', answer2: 'Un poco largo/alto', note: '50%/50% — puede ir en cualquier dirección' },
  2: { answer: 'OK/Estoy de acuerdo', note: 'Se mantiene la duración' },
  1: { answer: 'OK/Estoy de acuerdo', note: 'Se mantiene la duración' },
  0: { answer: 'OK/Estoy de acuerdo', note: 'Se mantiene la duración' },
};

export function getSponsorAnswers(attrs: SponsorAttributes, group: string): SponsorAnswer[] {
  const isElite = group.toLowerCase() === 'elite';

  const placement = Q1_PLACEMENT[attrs.image] ?? Q1_PLACEMENT[0];
  const q2Answer = attrs.expectations === 6 && isElite
    ? 'Ganar el campeonato'
    : Q2_GOAL[attrs.expectations] ?? Q2_GOAL[0];

  const q4 = Q4_AMOUNT[attrs.patience] ?? Q4_AMOUNT[0];
  const q5 = Q5_DURATION[attrs.patience] ?? Q5_DURATION[0];

  return [
    {
      questionNumber: 1,
      question: '¿En qué área del auto se colocará el aviso?',
      answer: placement.spot,
      note: placement.tier,
      attribute: 'imagen',
    },
    {
      questionNumber: 2,
      question: '¿Qué espera lograr la próxima temporada?',
      answer: q2Answer,
      note: attrs.expectations === 6 && !isElite ? 'En Elite sería "Ganar el campeonato"' : undefined,
      attribute: 'expectativas',
    },
    {
      questionNumber: 3,
      question: '¿Qué tan popular es el piloto entre los fanáticos?',
      answer: 'Es el favorito de los fanáticos',
      note: 'Siempre esta respuesta, independiente de los atributos',
      attribute: '—',
    },
    {
      questionNumber: 4,
      question: '¿Qué opina sobre la cantidad propuesta?',
      answer: q4.answer,
      note: q4.note,
      note2: q4.note2,
      attribute: 'paciencia',
    },
    {
      questionNumber: 5,
      question: '¿Qué opinas de la duración del contrato?',
      answer: q5.answer,
      answer2: q5.answer2,
      note: q5.note,
      attribute: 'paciencia',
    },
  ];
}
