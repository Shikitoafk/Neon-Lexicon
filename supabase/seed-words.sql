-- Run in Supabase SQL Editor to fill the empty `words` table.
-- Columns: word, translation, category, difficulty (1=easy, 2=medium, 3=hard)

INSERT INTO words (word, translation, category, difficulty) VALUES
  ('code', 'код', 'IT', 1),
  ('server', 'сервер', 'IT', 2),
  ('database', 'база данных', 'IT', 3),
  ('algorithm', 'алгоритм', 'IT', 3),
  ('run', 'бежать', 'Basic', 1),
  ('city', 'город', 'Basic', 1),
  ('danger', 'опасность', 'Basic', 2),
  ('escape', 'побег', 'Basic', 2),
  ('analyze', 'анализировать', 'IELTS', 2),
  ('evidence', 'доказательство', 'IELTS', 2),
  ('hypothesis', 'гипотеза', 'IELTS', 3),
  ('consequently', 'следовательно', 'IELTS', 3);

-- Allow public read (adjust if you use RLS):
-- CREATE POLICY "Anyone can read words" ON words FOR SELECT USING (true);
