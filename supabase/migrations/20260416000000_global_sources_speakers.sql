-- Hybrid Sources and Speakers: Public seed data + user contributions
-- Fixed: Make user_id nullable for global entries

-- Make user_id nullable (for global entries)
alter table public.sources alter column user_id drop not null;
alter table public.speakers alter column user_id drop not null;

-- Add is_global flag if not exists
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'sources' and column_name = 'is_global') then
    alter table public.sources add column is_global boolean not null default false;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'speakers' and column_name = 'is_global') then
    alter table public.speakers add column is_global boolean not null default false;
  end if;
end $$;

-- Grant permissions
grant select, insert, update, delete on table public.sources to anon, authenticated;
grant select, insert, update, delete on table public.speakers to anon, authenticated;

-- Seed common Islamic sources (only if table is empty)
insert into public.sources (name, is_global, created_at)
select * from (
  values
    ('Al-Misbah', true, now()),
    ('Al-Tafsir al-Munir', true, now()),
    ('Fiqh us-Sunnah', true, now()),
    ('Hisnul Muslim', true, now()),
    ('Khutbah', true, now()),
    ('Kitab al-Adzkar', true, now()),
    ('Lecture', true, now()),
    ('Podcast', true, now()),
    ('Seminar', true, now()),
    ('Shaykh Abdulsalam', true, now()),
    ('Tafsir al-Jalalayn', true, now()),
    ('Tafsir al-Quran al-Azhim', true, now()),
    ('Youtube', true, now())
) as t(name, is_global, created_at)
where not exists (select 1 from public.sources limit 1);

-- Seed common Islamic speakers/scholars (only if table is empty)
insert into public.speakers (name, is_global, created_at)
select * from (
  values
    ('Shaykh Abdul Hakim', true, now()),
    ('Shaykh Abdullah Faisal', true, now()),
    ('Shaykh Abu Bakr al-Jazairi', true, now()),
    ('Shaykh Hamdi al-Amin', true, now()),
    ('Shaykh Hany Muhammad', true, now()),
    ('Shaykh Ibrahim Dugul', true, now()),
    ('Shaykh Mishary Rashid Alafasy', true, now()),
    ('Shaykh Muhammad Anwar', true, now()),
    ('Shaykh Muhammad Ayyub', true, now()),
    ('Shaykh Muhammad Hassan', true, now()),
    ('Shaykh Muhammad Jibaly', true, now()),
    ('Shaykh Mustafa Islam', true, now()),
    ('Shaykh Nouman Ali Khan', true, now()),
    ('Shaykh Omar Atia', true, now()),
    ('Shaykh Salman al-Odah', true, now()),
    ('Shaykh Saood al-Qasim', true, now()),
    ('Shaykh Uthman Khattab', true, now()),
    ('Ustadz Adi Hidayat', true, now()),
    ('Ustadz Ammiar Baharun', true, now()),
    ('Ustadz Egy Mohamed', true, now()),
    ('Ustadz Hanan Attaki', true, now()),
    ('Ustadz Jhon Rio Adi Saputra', true, now()),
    ('Ustadz Khalid Abdurrahman', true, now()),
    ('Ustadz Maulana Akbar', true, now()),
    ('Ustadz Muhammad Abduh Tuasikal', true, now()),
    ('Ustadz Nouh Falconi', true, now()),
    ('Ustadz Oemar Zaky', true, now()),
    ('Ustadz Salim A fillah', true, now()),
    ('Ustadz Wijayanto', true, now())
) as t(name, is_global, created_at)
where not exists (select 1 from public.speakers limit 1);
