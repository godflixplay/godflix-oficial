
-- Inserir projetos exemplo
WITH inserted AS (
  INSERT INTO public.projetos (slug, titulo, sinopse, sinopse_completa, categoria, imagem_url, meta, arrecadado, apoiadores, dias_restantes, status, destaque)
  VALUES
    ('o-chamado', 'O Chamado', 'Um jovem pastor enfrenta uma crise de fé ao descobrir segredos sobre sua família enquanto lidera uma comunidade em tempos de adversidade.', 'Em uma pequena cidade do interior do Brasil, o jovem pastor Daniel descobre que sua família guarda segredos que podem abalar os alicerces de tudo em que acredita. Enquanto luta com suas próprias dúvidas, ele precisa liderar sua comunidade através de uma crise que ameaça destruir a cidade. Uma jornada profunda sobre fé, redenção e o verdadeiro significado do chamado divino.', 'Filme', 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1920&h=1080&fit=crop', 500000, 287500, 1432, 45, 'em_financiamento', false),
    ('graca-infinita', 'Graça Infinita', 'Série documental que acompanha histórias reais de transformação e fé em comunidades ao redor do mundo.', 'Graça Infinita é uma série documental de 8 episódios que viaja por 12 países documentando histórias extraordinárias de transformação espiritual. De favelas brasileiras a aldeias africanas, de centros urbanos europeus a comunidades remotas na Ásia, cada episódio revela como a fé pode transformar vidas e comunidades inteiras.', 'Documentário', 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1920&h=1080&fit=crop', 300000, 195000, 876, 30, 'em_financiamento', false),
    ('os-apostolos', 'Os Apóstolos', 'Série épica que reconta a jornada dos doze apóstolos após a ressurreição de Cristo.', 'Uma produção ambiciosa de 12 episódios que acompanha cada um dos doze apóstolos em suas jornadas individuais para levar a mensagem do Evangelho ao mundo antigo. Com reconstituições históricas precisas e narrativa envolvente.', 'Série', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&h=1080&fit=crop', 800000, 520000, 2341, 60, 'em_financiamento', false),
    ('luz-do-mundo', 'Luz do Mundo', 'Animação que conta parábolas bíblicas de forma envolvente para crianças e famílias.', 'Luz do Mundo é uma série de animação com 26 episódios que reconta as mais belas parábolas bíblicas usando animação 3D de alta qualidade. Cada episódio traz lições valiosas sobre amor, compaixão, perdão e fé, tornando os ensinamentos bíblicos acessíveis para toda a família.', 'Animação', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1920&h=1080&fit=crop', 400000, 160000, 923, 90, 'em_financiamento', false),
    ('a-travessia', 'A Travessia', 'Drama sobre uma família de refugiados cristãos que busca recomeçar a vida em um novo país.', 'A família Haddad foge da perseguição religiosa no Oriente Médio e busca refúgio no Brasil. Entre as dificuldades de adaptação, preconceito e saudade, eles encontram na fé a força para reconstruir suas vidas. Um filme que fala sobre esperança, resiliência e o poder da comunidade cristã.', 'Filme', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&h=1080&fit=crop', 350000, 98000, 567, 75, 'em_financiamento', false),
    ('o-milagre', 'O Milagre de Santa Cruz', 'Baseado em fatos reais, conta a história de uma cura inexplicável em uma pequena paróquia.', 'Em 1987, na pequena cidade de Santa Cruz, interior de Minas Gerais, algo inexplicável aconteceu. Uma criança desenganada pelos médicos foi curada após uma corrente de oração que mobilizou toda a comunidade. Este documentário reconstrói os eventos com depoimentos reais e investigação cuidadosa.', 'Documentário', 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1920&h=1080&fit=crop', 200000, 200000, 1102, 0, 'em_producao', false),
    ('redencao', 'Redenção', 'Peça teatral gravada sobre a jornada de um homem em busca de perdão e propósito.', 'Redenção é uma peça teatral profundamente emocional que acompanha Carlos, um homem atormentado pelo passado, em sua jornada de autodescoberta e reconciliação com Deus. Gravada no Teatro Municipal com produção cinematográfica de alto nível.', 'Teatro', 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=1920&h=1080&fit=crop', 150000, 150000, 654, 0, 'concluido', false),
    ('sementes-de-fe', 'Sementes de Fé', 'Série animada que ensina valores cristãos através de aventuras de um grupo de amigos.', 'Acompanhe Tiago, Sara, Lucas e Mila em aventuras incríveis onde aprendem sobre os valores cristãos de forma divertida e envolvente. Cada episódio apresenta um desafio diferente que os amigos precisam superar juntos, usando a sabedoria bíblica como guia.', 'Animação', 'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=1920&h=1080&fit=crop', 250000, 75000, 412, 120, 'em_financiamento', false)
  ON CONFLICT (slug) DO NOTHING
  RETURNING id, slug
)
-- Inserir equipe de cada projeto
INSERT INTO public.equipe_membros (projeto_id, nome, papel)
SELECT i.id, m.nome, m.papel
FROM inserted i
JOIN (VALUES
  ('o-chamado', 'Lucas Mendes', 'Diretor'),
  ('o-chamado', 'Ana Clara Santos', 'Produtora'),
  ('o-chamado', 'Pedro Oliveira', 'Roteirista'),
  ('graca-infinita', 'Maria Silva', 'Diretora'),
  ('graca-infinita', 'João Costa', 'Produtor'),
  ('os-apostolos', 'Roberto Almeida', 'Diretor'),
  ('os-apostolos', 'Carla Dias', 'Produtora'),
  ('os-apostolos', 'Fernando Lima', 'Roteirista'),
  ('luz-do-mundo', 'Patrícia Nunes', 'Diretora'),
  ('luz-do-mundo', 'Studio Luz', 'Animação'),
  ('a-travessia', 'Samuel Reis', 'Diretor'),
  ('a-travessia', 'Débora Martins', 'Produtora'),
  ('o-milagre', 'Marcos Paulo', 'Diretor'),
  ('o-milagre', 'Helena Torres', 'Produtora'),
  ('redencao', 'Renata Campos', 'Diretora'),
  ('redencao', 'Teatro Vida', 'Produção'),
  ('sementes-de-fe', 'Carolina Luz', 'Diretora'),
  ('sementes-de-fe', 'Pixel Faith Studios', 'Animação')
) AS m(slug, nome, papel) ON m.slug = i.slug;

-- Inserir opções de apoio padrão para cada projeto novo
INSERT INTO public.opcoes_apoio (projeto_id, valor, titulo, descricao, recompensas, ordem)
SELECT p.id, t.valor, t.titulo, t.descricao, t.recompensas, t.ordem
FROM public.projetos p
CROSS JOIN (VALUES
  (25::numeric, 'Apoiador', 'Contribua com o projeto e receba um agradecimento especial da equipe.', ARRAY['Agradecimento digital personalizado', 'Acesso a atualizações do projeto'], 0),
  (100::numeric, 'Parceiro', 'Tenha acesso antecipado ao conteúdo e acompanhe os bastidores da produção.', ARRAY['Acesso antecipado ao conteúdo final', 'Vídeos exclusivos dos bastidores', 'Nome na lista de parceiros'], 1),
  (500::numeric, 'Coprodutor Cultural', 'Seu nome nos créditos oficiais. Você faz parte desta história.', ARRAY['Nome nos créditos do projeto', 'Convite para pré-estreia', 'Kit exclusivo da produção', 'Encontro virtual com a equipe'], 2)
) AS t(valor, titulo, descricao, recompensas, ordem)
WHERE p.slug IN ('o-chamado','graca-infinita','os-apostolos','luz-do-mundo','a-travessia','o-milagre','redencao','sementes-de-fe')
AND NOT EXISTS (
  SELECT 1 FROM public.opcoes_apoio o WHERE o.projeto_id = p.id AND o.titulo = t.titulo
);
