export type Categoria = "Filme" | "Série" | "Documentário" | "Animação" | "Teatro";

export type StatusProjeto = "em_financiamento" | "em_producao" | "concluido";

export interface Projeto {
  id: string;
  titulo: string;
  sinopse: string;
  sinopseCompleta: string;
  categoria: Categoria;
  imagem: string;
  meta: number;
  arrecadado: number;
  apoiadores: number;
  diasRestantes: number;
  status: StatusProjeto;
  equipe: string[];
  destaque?: boolean;
}

export interface PlanoMembro {
  id: string;
  nome: string;
  preco: number;
  beneficios: string[];
  destaque?: boolean;
}

export interface OpcaoApoio {
  id: string;
  valor: number;
  titulo: string;
  descricao: string;
  recompensas: string[];
}

export const projetos: Projeto[] = [
  {
    id: "o-chamado",
    titulo: "O Chamado",
    sinopse: "Um jovem pastor enfrenta uma crise de fé ao descobrir segredos sobre sua família enquanto lidera uma comunidade em tempos de adversidade.",
    sinopseCompleta: "Em uma pequena cidade do interior do Brasil, o jovem pastor Daniel descobre que sua família guarda segredos que podem abalar os alicerces de tudo em que acredita. Enquanto luta com suas próprias dúvidas, ele precisa liderar sua comunidade através de uma crise que ameaça destruir a cidade. Uma jornada profunda sobre fé, redenção e o verdadeiro significado do chamado divino.",
    categoria: "Filme",
    imagem: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&h=675&fit=crop",
    meta: 500000,
    arrecadado: 287500,
    apoiadores: 1432,
    diasRestantes: 45,
    status: "em_financiamento",
    equipe: ["Dir. Lucas Mendes", "Prod. Ana Clara Santos", "Rot. Pedro Oliveira"],
    destaque: true,
  },
  {
    id: "graca-infinita",
    titulo: "Graça Infinita",
    sinopse: "Série documental que acompanha histórias reais de transformação e fé em comunidades ao redor do mundo.",
    sinopseCompleta: "Graça Infinita é uma série documental de 8 episódios que viaja por 12 países documentando histórias extraordinárias de transformação espiritual. De favelas brasileiras a aldeias africanas, de centros urbanos europeus a comunidades remotas na Ásia, cada episódio revela como a fé pode transformar vidas e comunidades inteiras.",
    categoria: "Documentário",
    imagem: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&h=450&fit=crop",
    meta: 300000,
    arrecadado: 195000,
    apoiadores: 876,
    diasRestantes: 30,
    status: "em_financiamento",
    equipe: ["Dir. Maria Silva", "Prod. João Costa"],
  },
  {
    id: "os-apostolos",
    titulo: "Os Apóstolos",
    sinopse: "Série épica que reconta a jornada dos doze apóstolos após a ressurreição de Cristo.",
    sinopseCompleta: "Uma produção ambiciosa de 12 episódios que acompanha cada um dos doze apóstolos em suas jornadas individuais para levar a mensagem do Evangelho ao mundo antigo. Com reconstituições históricas precisas e narrativa envolvente.",
    categoria: "Série",
    imagem: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=450&fit=crop",
    meta: 800000,
    arrecadado: 520000,
    apoiadores: 2341,
    diasRestantes: 60,
    status: "em_financiamento",
    equipe: ["Dir. Roberto Almeida", "Prod. Carla Dias", "Rot. Fernando Lima"],
  },
  {
    id: "luz-do-mundo",
    titulo: "Luz do Mundo",
    sinopse: "Animação que conta parábolas bíblicas de forma envolvente para crianças e famílias.",
    sinopseCompleta: "Luz do Mundo é uma série de animação com 26 episódios que reconta as mais belas parábolas bíblicas usando animação 3D de alta qualidade. Cada episódio traz lições valiosas sobre amor, compaixão, perdão e fé, tornando os ensinamentos bíblicos acessíveis para toda a família.",
    categoria: "Animação",
    imagem: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&h=450&fit=crop",
    meta: 400000,
    arrecadado: 160000,
    apoiadores: 923,
    diasRestantes: 90,
    status: "em_financiamento",
    equipe: ["Dir. Patrícia Nunes", "Anim. Studio Luz"],
  },
  {
    id: "a-travessia",
    titulo: "A Travessia",
    sinopse: "Drama sobre uma família de refugiados cristãos que busca recomeçar a vida em um novo país.",
    sinopseCompleta: "A família Haddad foge da perseguição religiosa no Oriente Médio e busca refúgio no Brasil. Entre as dificuldades de adaptação, preconceito e saudade, eles encontram na fé a força para reconstruir suas vidas. Um filme que fala sobre esperança, resiliência e o poder da comunidade cristã.",
    categoria: "Filme",
    imagem: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=450&fit=crop",
    meta: 350000,
    arrecadado: 98000,
    apoiadores: 567,
    diasRestantes: 75,
    status: "em_financiamento",
    equipe: ["Dir. Samuel Reis", "Prod. Débora Martins"],
  },
  {
    id: "o-milagre",
    titulo: "O Milagre de Santa Cruz",
    sinopse: "Baseado em fatos reais, conta a história de uma cura inexplicável em uma pequena paróquia.",
    sinopseCompleta: "Em 1987, na pequena cidade de Santa Cruz, interior de Minas Gerais, algo inexplicável aconteceu. Uma criança desenganada pelos médicos foi curada após uma corrente de oração que mobilizou toda a comunidade. Este documentário reconstrói os eventos com depoimentos reais e investigação cuidadosa.",
    categoria: "Documentário",
    imagem: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&h=450&fit=crop",
    meta: 200000,
    arrecadado: 200000,
    apoiadores: 1102,
    diasRestantes: 0,
    status: "em_producao",
    equipe: ["Dir. Marcos Paulo", "Prod. Helena Torres"],
  },
  {
    id: "redenção",
    titulo: "Redenção",
    sinopse: "Peça teatral gravada sobre a jornada de um homem em busca de perdão e propósito.",
    sinopseCompleta: "Redenção é uma peça teatral profundamente emocional que acompanha Carlos, um homem atormentado pelo passado, em sua jornada de autodescoberta e reconciliação com Deus. Gravada no Teatro Municipal com produção cinematográfica de alto nível.",
    categoria: "Teatro",
    imagem: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&h=450&fit=crop",
    meta: 150000,
    arrecadado: 150000,
    apoiadores: 654,
    diasRestantes: 0,
    status: "concluido",
    equipe: ["Dir. Renata Campos", "Prod. Teatro Vida"],
  },
  {
    id: "sementes-de-fe",
    titulo: "Sementes de Fé",
    sinopse: "Série animada que ensina valores cristãos através de aventuras de um grupo de amigos.",
    sinopseCompleta: "Acompanhe Tiago, Sara, Lucas e Mila em aventuras incríveis onde aprendem sobre os valores cristãos de forma divertida e envolvente. Cada episódio apresenta um desafio diferente que os amigos precisam superar juntos, usando a sabedoria bíblica como guia.",
    categoria: "Animação",
    imagem: "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=800&h=450&fit=crop",
    meta: 250000,
    arrecadado: 75000,
    apoiadores: 412,
    diasRestantes: 120,
    status: "em_financiamento",
    equipe: ["Dir. Carolina Luz", "Anim. Pixel Faith Studios"],
  },
];

export const planosMembro: PlanoMembro[] = [
  {
    id: "semente",
    nome: "Semente",
    preco: 19.90,
    beneficios: [
      "Acesso a atualizações exclusivas dos projetos",
      "Nome nos créditos como apoiador",
      "Newsletter mensal com bastidores",
      "Badge de membro na plataforma",
    ],
  },
  {
    id: "luz",
    nome: "Luz",
    preco: 49.90,
    beneficios: [
      "Todos os benefícios do plano Semente",
      "Acesso antecipado a trailers e teasers",
      "Convites para eventos online exclusivos",
      "Desconto em produtos oficiais",
      "Voto em enquetes sobre novos projetos",
    ],
    destaque: true,
  },
  {
    id: "graca",
    nome: "Graça",
    preco: 99.90,
    beneficios: [
      "Todos os benefícios do plano Luz",
      "Acesso a pré-estreias digitais",
      "Encontros virtuais com diretores e elenco",
      "Kit exclusivo Godflix anual",
      "Crédito especial como produtor associado",
      "Participação em grupos VIP",
    ],
  },
];

export const opcoesApoio: OpcaoApoio[] = [
  {
    id: "apoio-25",
    valor: 25,
    titulo: "Apoiador",
    descricao: "Contribua com o projeto e faça parte desta história.",
    recompensas: ["Nome nos créditos", "Agradecimento digital"],
  },
  {
    id: "apoio-50",
    valor: 50,
    titulo: "Colaborador",
    descricao: "Receba conteúdos exclusivos do processo de produção.",
    recompensas: ["Nome nos créditos", "Fotos exclusivas dos bastidores", "Wallpaper digital"],
  },
  {
    id: "apoio-100",
    valor: 100,
    titulo: "Produtor Amigo",
    descricao: "Acesso privilegiado ao desenvolvimento do projeto.",
    recompensas: ["Nome nos créditos especiais", "Making of exclusivo", "Poster digital autografado", "Acesso antecipado"],
  },
  {
    id: "apoio-250",
    valor: 250,
    titulo: "Produtor Associado",
    descricao: "Seja parte fundamental desta produção.",
    recompensas: ["Crédito como produtor associado", "Convite para pré-estreia", "Kit físico exclusivo", "Encontro virtual com a equipe"],
  },
];

export const categorias: Categoria[] = ["Filme", "Série", "Documentário", "Animação", "Teatro"];

export function getProjetosByCategoria(categoria: Categoria): Projeto[] {
  return projetos.filter((p) => p.categoria === categoria);
}

export function getProjetoById(id: string): Projeto | undefined {
  return projetos.find((p) => p.id === id);
}

export function getProjetoDestaque(): Projeto {
  return projetos.find((p) => p.destaque) || projetos[0];
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function calcProgress(arrecadado: number, meta: number): number {
  return Math.min(Math.round((arrecadado / meta) * 100), 100);
}
