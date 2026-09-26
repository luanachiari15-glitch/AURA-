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

export const INITIAL_HABITS: Habit[] = [
  {
    id: 'h1',
    title: 'Treino de força ou cardio (45 min)',
    description: 'Movimentar o corpo com intensidade e foco',
    areaId: 'exercicio',
    frequency: 'daily',
    createdAt: '2026-09-01',
  },
  {
    id: 'h2',
    title: 'Alongamento ou mobilidade matinal (10 min)',
    description: 'Soltar articulações e despertar a postura',
    areaId: 'exercicio',
    frequency: 'daily',
    createdAt: '2026-09-01',
  },
  {
    id: 'h3',
    title: 'Beber ao menos 2,5L de água',
    description: 'Garrafa sempre à vista e hidratação constante',
    areaId: 'alimentacao',
    frequency: 'daily',
    createdAt: '2026-09-01',
  },
  {
    id: 'h4',
    title: 'Alimentação limpa (zero ultraprocessados)',
    description: 'Comida de verdade, rica em nutrientes e sem excesso de açúcar',
    areaId: 'alimentacao',
    frequency: 'daily',
    createdAt: '2026-09-01',
  },
  {
    id: 'h5',
    title: 'Bloco de Deep Work sem celular (90 min)',
    description: 'Foco ininterrupto na tarefa mais importante do dia',
    areaId: 'trabalho',
    frequency: 'weekdays',
    createdAt: '2026-09-01',
  },
  {
    id: 'h6',
    title: 'Organizar prioridades do dia seguinte à noite',
    description: 'Definir as 3 metas essenciais antes de dormir',
    areaId: 'trabalho',
    frequency: 'daily',
    createdAt: '2026-09-01',
  },
  {
    id: 'h7',
    title: 'Higiene do sono & luzes baixas às 22h',
    description: 'Sem telas luminosas 30 min antes de repousar',
    areaId: 'autocuidado',
    frequency: 'daily',
    createdAt: '2026-09-01',
  },
  {
    id: 'h8',
    title: 'Skincare e ritual de relaxamento pessoal',
    description: 'Cuidar do rosto, respiração e conforto corporal',
    areaId: 'autocuidado',
    frequency: 'daily',
    createdAt: '2026-09-01',
  },
  {
    id: 'h9',
    title: 'Momento de lazer criativo ou hobby (20 min)',
    description: 'Música, pintura, leitura de ficção ou tempo ao ar livre',
    areaId: 'hobbies',
    frequency: 'daily',
    createdAt: '2026-09-01',
  },
  {
    id: 'h10',
    title: 'Ler 15 páginas de um livro enriquecedor',
    description: 'Conhecimento aplicado para expandir horizontes',
    areaId: 'desenvolvimento',
    frequency: 'daily',
    createdAt: '2026-09-01',
  },
  {
    id: 'h11',
    title: 'Prática de visualização & afirmações matinais',
    description: 'Sentir com clareza a vibração da versão já realizada',
    areaId: 'lei_da_atracao',
    frequency: 'daily',
    createdAt: '2026-09-01',
  },
  {
    id: 'h12',
    title: 'Diário de gratidão (3 motivos sinceros)',
    description: 'Agradecer pelo presente e pelo que já está a caminho',
    areaId: 'lei_da_atracao',
    frequency: 'daily',
    createdAt: '2026-09-01',
  },
  {
    id: 'h13',
    title: 'Registrar gastos do dia & consciência financeira',
    description: 'Anotar saídas e manter o orçamento em equilíbrio',
    areaId: 'financas',
    frequency: 'daily',
    createdAt: '2026-09-01',
  },
  {
    id: 'h14',
    title: 'Ritual de Glow Up & autocuidado estético',
    description: 'Cuidados com cabelo, pele, postura e alinhamento visual',
    areaId: 'glow_up',
    frequency: 'daily',
    createdAt: '2026-09-01',
  },
];

export const INITIAL_GOALS: AreaGoal[] = [
  {
    id: 'g1',
    areaId: 'exercicio',
    title: 'Corpo forte, ágil e 100% disposto',
    targetDescription: 'Completar 60 sessões de treino com evolução consistente de carga e resistência até dezembro.',
    completed: false,
    deadline: '31 de Dezembro',
    milestones: [
      { id: 'm1-1', title: 'Completar primeiro mês sem faltar mais de 2 treinos', completed: true },
      { id: 'm1-2', title: 'Atingir 5km de corrida contínua ou bater meta de cardio', completed: false },
      { id: 'm1-3', title: 'Sentir disposição máxima ao acordar todos os dias', completed: false },
    ],
  },
  {
    id: 'g2',
    areaId: 'alimentacao',
    title: 'Rotina nutricional consciente e anti-inflamatória',
    targetDescription: 'Consolidar hábitos alimentares limpos, sem picos de glicemia e com hidratação diária exemplar.',
    completed: false,
    deadline: '31 de Dezembro',
    milestones: [
      { id: 'm2-1', title: 'Manter 2.5L de água por 21 dias consecutivos', completed: true },
      { id: 'm2-2', title: 'Substituir lanches ultraprocessados por opções nutritivas', completed: false },
      { id: 'm2-3', title: 'Preparar refeições planejadas com antecedência', completed: false },
    ],
  },
  {
    id: 'g3',
    areaId: 'trabalho',
    title: 'Elevação de patamar profissional & produtividade focada',
    targetDescription: 'Entregar o grande projeto do trimestre e estruturar uma rotina de trabalho sem procrastinação.',
    completed: false,
    deadline: '31 de Dezembro',
    milestones: [
      { id: 'm3-1', title: 'Eliminar notificações durante blocos de foco', completed: true },
      { id: 'm3-2', title: 'Finalizar entregas principais do trimestre com excelência', completed: false },
      { id: 'm3-3', title: 'Estruturar metas claras e plano de ação para 2027', completed: false },
    ],
  },
  {
    id: 'g4',
    areaId: 'autocuidado',
    title: 'Higiene do sono & paz interior inabalável',
    targetDescription: 'Garantir noites de sono profundo de 7h a 8h e rituais que recarregam a energia física e mental.',
    completed: false,
    deadline: '31 de Dezembro',
    milestones: [
      { id: 'm4-1', title: 'Dormir antes das 23h na maioria dos dias', completed: false },
      { id: 'm4-2', title: 'Ritual matinal sem pegar no telefone nos primeiros 20 min', completed: true },
    ],
  },
  {
    id: 'g5',
    areaId: 'hobbies',
    title: 'Espaço sagrado para criatividade e leveza',
    targetDescription: 'Cultivar hobbies que alimentam a alma sem a pressão de produtividade.',
    completed: false,
    deadline: '31 de Dezembro',
    milestones: [
      { id: 'm5-1', title: 'Dedicar ao menos 2h semanais a projetos criativos prazerosos', completed: false },
      { id: 'm5-2', title: 'Experimentar uma nova habilidade ou atividade artística', completed: false },
    ],
  },
  {
    id: 'g6',
    areaId: 'desenvolvimento',
    title: 'Concluir 4 livros transformadores até dezembro',
    targetDescription: 'Absorver e aplicar conceitos de psicologia, maestria pessoal e clareza estratégica.',
    completed: false,
    deadline: '31 de Dezembro',
    milestones: [
      { id: 'm6-1', title: 'Livro 1 lido e com anotações práticas', completed: true },
      { id: 'm6-2', title: 'Livro 2 concluído', completed: false },
      { id: 'm6-3', title: 'Livro 3 concluído', completed: false },
      { id: 'm6-4', title: 'Livro 4 concluído até dezembro', completed: false },
    ],
  },
  {
    id: 'g7',
    areaId: 'lei_da_atracao',
    title: 'Incorporar totalmente a vibração do meu Eu Ideal',
    targetDescription: 'Viver, decidir e sentir a partir do estado de realização plena, abundância e merecimento.',
    completed: false,
    deadline: '31 de Dezembro',
    milestones: [
      { id: 'm7-1', title: 'Praticar visualização sensorial vívida todas as manhãs', completed: true },
      { id: 'm7-2', title: 'Substituir pensamentos de escassez por certezas de merecimento', completed: false },
      { id: 'm7-3', title: 'Chegar em 31 de Dezembro celebrando as manifestações concretizadas', completed: false },
    ],
  },
  {
    id: 'g8',
    areaId: 'financas',
    title: 'Independência, organização & reserva estratégica',
    targetDescription: 'Estruturar controle financeiro rigoroso, poupar com intencionalidade e fechar dezembro com finanças prósperas.',
    completed: false,
    deadline: '31 de Dezembro',
    milestones: [
      { id: 'm8-1', title: 'Planilhar todas as entradas, gastos e investimentos do mês', completed: true },
      { id: 'm8-2', title: 'Construir ou reforçar a meta estipulada de reserva de emergência', completed: false },
      { id: 'm8-3', title: 'Eliminar gastos supérfluos e direcionar capital para crescimento', completed: false },
    ],
  },
  {
    id: 'g9',
    areaId: 'glow_up',
    title: 'Transformação visual, postura & magnetismo pessoal',
    targetDescription: 'Elevar a autoimagem, consolidar rituais de beleza, cabelo, pele e estilo que transmitem poder e confiança.',
    completed: false,
    deadline: '31 de Dezembro',
    milestones: [
      { id: 'm9-1', title: 'Estruturar guarda-roupa alinhado à minha melhor versão', completed: true },
      { id: 'm9-2', title: 'Rotina impecável de cuidados diários com pele, unhas e cabelo', completed: false },
      { id: 'm9-3', title: 'Postura corporal ereta, presença magnética e segurança ao falar', completed: false },
    ],
  },
];

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
