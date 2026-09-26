import { LifeArea, LifeAreaId, Habit, AreaGoal, Affirmation, VisionItem } from '../types';

export const LIFE_AREAS: Record<LifeAreaId, LifeArea> = {
  exercicio: {
    id: 'exercicio',
    label: 'Exercício Físico',
    shortLabel: 'Treino',
    icon: 'Dumbbell',
    color: '#ea580c', // Vivid electric orange
    bgLight: 'rgba(234, 88, 12, 0.08)',
    borderLight: 'rgba(234, 88, 12, 0.25)',
    description: 'Movimento, força, condicionamento e energia vital',
  },
  alimentacao: {
    id: 'alimentacao',
    label: 'Alimentação Consciente',
    shortLabel: 'Nutrição',
    icon: 'Apple',
    color: '#059669', // Vivid emerald
    bgLight: 'rgba(5, 150, 105, 0.08)',
    borderLight: 'rgba(5, 150, 105, 0.25)',
    description: 'Combustível limpo, hidratação profunda e vitalidade celular',
  },
  trabalho: {
    id: 'trabalho',
    label: 'Trabalho & Carreira',
    shortLabel: 'Trabalho',
    icon: 'Briefcase',
    color: '#2563eb', // Vivid royal blue
    bgLight: 'rgba(37, 99, 235, 0.08)',
    borderLight: 'rgba(37, 99, 235, 0.25)',
    description: 'Foco profundo, alta performance e progresso profissional',
  },
  autocuidado: {
    id: 'autocuidado',
    label: 'Autocuidado & Sono',
    shortLabel: 'Autocuidado',
    icon: 'Sparkles',
    color: '#db2777', // Vivid pink / fuchsia
    bgLight: 'rgba(219, 39, 119, 0.08)',
    borderLight: 'rgba(219, 39, 119, 0.25)',
    description: 'Recuperação, rituais de presença e higiene do sono',
  },
  hobbies: {
    id: 'hobbies',
    label: 'Hobbies & Criatividade',
    shortLabel: 'Hobbies',
    icon: 'Palette',
    color: '#0891b2', // Vivid cyan / ocean
    bgLight: 'rgba(8, 145, 178, 0.08)',
    borderLight: 'rgba(8, 145, 178, 0.25)',
    description: 'Expressão artística, lazer intencional e leveza mental',
  },
  desenvolvimento: {
    id: 'desenvolvimento',
    label: 'Desenvolvimento Pessoal',
    shortLabel: 'Evolução',
    icon: 'BookOpen',
    color: '#7c3aed', // Vivid violet / electric purple
    bgLight: 'rgba(124, 58, 237, 0.08)',
    borderLight: 'rgba(124, 58, 237, 0.25)',
    description: 'Leitura, expansão de mentalidade e novos conhecimentos',
  },
  lei_da_atracao: {
    id: 'lei_da_atracao',
    label: 'Lei da Atração & Mente',
    shortLabel: 'Manifestação',
    icon: 'Compass',
    color: '#d97706', // Vivid amber / gold
    bgLight: 'rgba(217, 119, 6, 0.08)',
    borderLight: 'rgba(217, 119, 6, 0.25)',
    description: 'Vibração elevada, visualização clara e alinhamento do Eu Ideal',
  },
  financas: {
    id: 'financas',
    label: 'Finanças & Prosperidade',
    shortLabel: 'Finanças',
    icon: 'Wallet',
    color: '#0d9488', // Vivid teal / emerald green
    bgLight: 'rgba(13, 148, 136, 0.08)',
    borderLight: 'rgba(13, 148, 136, 0.25)',
    description: 'Organização financeira, reserva estratégica, investimentos e abundância',
  },
  glow_up: {
    id: 'glow_up',
    label: 'Glow Up & Autoimagem',
    shortLabel: 'Glow Up',
    icon: 'Sparkle',
    color: '#f43f5e', // Vibrant rose / coral
    bgLight: 'rgba(244, 63, 94, 0.08)',
    borderLight: 'rgba(244, 63, 94, 0.25)',
    description: 'Estética, postura, estilo pessoal, confiança e brilho radiante',
  },
};

export const INITIAL_HABITS: Habit[] = [];

export const INITIAL_GOALS: AreaGoal[] = [];

export const INITIAL_AFFIRMATIONS: Affirmation[] = [
  {
    id: 'a1',
    text: 'Eu sou a pessoa disciplinada, serena e magnética que sempre sonhei em ser.',
    areaId: 'lei_da_atracao',
  },
  {
    id: 'a2',
    text: 'Cada hábito que cumpro hoje é um voto inegável na minha melhor versão de dezembro.',
    areaId: 'desenvolvimento',
  },
  {
    id: 'a3',
    text: 'Meu corpo responde com força, vitalidade e saúde radiante a cada escolha consciente.',
    areaId: 'exercicio',
  },
  {
    id: 'a4',
    text: 'O sucesso e a abundância fluem naturalmente para a minha dedicação e foco.',
    areaId: 'trabalho',
  },
  {
    id: 'a5',
    text: 'Eu mereço viver com calma, propósito e profunda gratidão por cada instante.',
    areaId: 'autocuidado',
  },
  {
    id: 'a6',
    text: 'A energia que eu emano hoje atrai exatamente as oportunidades que procuro.',
    areaId: 'lei_da_atracao',
  },
  {
    id: 'a7',
    text: 'Eu não espero a motivação aparecer: eu crio disciplina e a vitória segue meus passos.',
    areaId: 'desenvolvimento',
  },
  {
    id: 'a8',
    text: 'Em 31 de dezembro olharei para trás com imenso orgulho da pessoa que me tornei.',
    areaId: 'lei_da_atracao',
  },
];

export const INITIAL_VISION_ITEMS: VisionItem[] = [
  {
    id: 'v1',
    title: 'Identidade & Postura',
    statement: 'Em 31 de Dezembro, ando com a confiança de quem honrou cada promessa feita a si mesmo.',
    feeling: 'Segurança interna inabalável e serenidade',
    areaId: 'desenvolvimento',
  },
  {
    id: 'v2',
    title: 'Corpo & Energia',
    statement: 'Meu reflexo no espelho mostra tonicidade, saúde vigorosa e os olhos brilhando de vida.',
    feeling: 'Leveza física e potência atlética',
    areaId: 'exercicio',
  },
  {
    id: 'v3',
    title: 'Prosperidade & Carreira',
    statement: 'Meus projetos profissionais avançaram a passos largos, abrindo portas e colhendo frutos financeiros.',
    feeling: 'Abundância, merecimento e autorrealização',
    areaId: 'trabalho',
  },
  {
    id: 'v4',
    title: 'Vibração & Realização',
    statement: 'Sinto que o universo conspirou a favor de cada objetivo porque permaneci alinhado na certeza.',
    feeling: 'Gratidão transbordante e paz profunda',
    areaId: 'lei_da_atracao',
  },
];

export const ENCOURAGEMENT_PHRASES = [
  'Excelente! Você acabou de honrar uma promessa a si mesmo.',
  'Cada repetição constrói a identidade da sua melhor versão.',
  'Consistência silenciosa gera resultados extraordinários.',
  'Você está se tornando imparável!',
  'Essa é a vibração de quem conquista tudo o que projeta.',
  'O seu Eu de 31 de Dezembro agradece a escolha de hoje.',
  'Disciplina é a maior forma de amor-próprio.',
  'Mais um passo sólido na direção dos seus maiores sonhos.',
  'Orgulhe-se! A vitória pertence a quem não desiste nos dias comuns.',
  'Você está no controle da sua energia e do seu destino.',
];

export const COMPLETION_CELEBRATION_MESSAGES = [
  {
    title: 'Dia 100% Conquistado!',
    message: 'Você concluiu todos os hábitos de hoje com maestria. A sua melhor versão já é uma realidade em construção.',
  },
  {
    title: 'Alinhamento Impecável!',
    message: 'Nenhuma desculpa te parou hoje. Essa consistência está pavimentando seu caminho até dezembro.',
  },
  {
    title: 'Poder de Realização Ativo!',
    message: 'Tudo o que você emanou hoje em ação e mentalidade retornará multiplicado em prosperidade e bem-estar.',
  },
];

export const DEFAULT_NOTIFICATION_SETTINGS: import('../types').NotificationSettings = {
  enabled: false,
  consistencyEnabled: true,
  consistencyTime1: '08:30',
  consistencyTime2: '20:30',
  affirmationsEnabled: true,
  affirmationIntervalHours: 3,
  affirmationsStartTime: '09:00',
  affirmationsEndTime: '00:00',
};

export const CONSISTENCY_PUSH_MESSAGES = [
  'Seu AURA está te esperando ✦ Hora de cuidar da sua melhor versão.',
  'Não quebra a sequência 👀 Já fez seu checklist hoje?',
  'Pequenas ações. Todos os dias. É assim que sua nova versão é construída.',
  'O seu futuro agradece cada hábito cumprido hoje ✦ Abra o AURA.',
  'Checklist diário em andamento? Cada passo conta rumo a dezembro!',
  'Constância supera a motivação. Venha registrar seu progresso no AURA ✦',
  'Fim do dia se aproximando: hora de fechar seus hábitos com chave de ouro ✨',
  'Reserve 5 minutos para você e sua evolução pessoal agora ✦',
  'Seu compromisso de hoje está de pé? A consistência é o seu maior superpoder.',
  'Hora de elevar sua energia! O AURA está aberto para o seu checklist ✦',
  'Lembre-se do motivo pelo qual começou. Seu Eu de Dezembro conta com você!',
  'Um dia de cada vez, um hábito de cada vez. Vamos em frente? ✦',
];

