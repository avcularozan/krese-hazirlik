create extension if not exists "pgcrypto";

create table parent (
  id uuid primary key default gen_random_uuid(),
  email varchar(255) not null unique,
  password_hash varchar(255) not null,
  display_name varchar(120),
  locale varchar(8) not null default 'tr-TR',
  consent_at timestamptz,
  created_at timestamptz not null default now()
);

create table child (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references parent(id) on delete cascade,
  nickname varchar(80) not null,
  birth_date date not null,
  uses_real_name boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_child_parent on child(parent_id);

create table school_enrollment (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references child(id) on delete cascade,
  school_name varchar(160),
  start_date date not null,
  group_name varchar(80),
  had_previous_school varchar(24),
  daily_hours varchar(40),
  focus_areas text[] not null default '{}',
  adaptation_started_on date,
  created_at timestamptz not null default now()
);
create unique index idx_enrollment_child on school_enrollment(child_id);

create table development_area (
  id smallint primary key,
  code varchar(24) not null unique,
  name_tr varchar(120) not null,
  sort_order smallint not null
);

create table development_skill (
  id uuid primary key default gen_random_uuid(),
  area_id smallint not null references development_area(id),
  code varchar(32) not null unique,
  text_tr varchar(240) not null,
  min_age_months smallint not null,
  max_age_months smallint not null
);

create table daily_check_in (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references child(id) on delete cascade,
  check_in_date date not null,
  overall_mood smallint check (overall_mood between 1 and 4),
  note text,
  source varchar(12) not null default 'PARENT',
  created_at timestamptz not null default now(),
  unique (child_id, check_in_date, source)
);
create index idx_checkin_child_date on daily_check_in(child_id, check_in_date desc);

create table observation (
  id uuid primary key default gen_random_uuid(),
  check_in_id uuid not null references daily_check_in(id) on delete cascade,
  item_code varchar(32) not null,
  area_code varchar(24) not null,
  value smallint,                         -- null = "gözlemleme fırsatım olmadı"
  constraint value_range check (value is null or value between 0 and 3)
);
create index idx_observation_checkin on observation(check_in_id);

create table skill_observation (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references child(id) on delete cascade,
  skill_id uuid not null references development_skill(id),
  level varchar(8) not null,              -- IND | REM | HELP | NOT | NA
  observed_on date not null,
  source varchar(12) not null default 'PARENT',
  note text
);
create index idx_skillobs_child on skill_observation(child_id, observed_on desc);

create table teacher_access_code (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references child(id) on delete cascade,
  code_hash varchar(255) not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  max_uses smallint not null default 60,
  used_count smallint not null default 0
);
create index idx_code_child on teacher_access_code(child_id);

create table teacher_observation (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references child(id) on delete cascade,
  access_code_id uuid references teacher_access_code(id) on delete set null,
  teacher_alias varchar(120),
  observed_on date not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);
create index idx_tobs_child on teacher_observation(child_id, observed_on desc);

create table activity (
  id uuid primary key default gen_random_uuid(),
  code varchar(32) not null unique,
  title_tr varchar(160) not null,
  area_code varchar(24) not null,
  min_age_months smallint not null,
  max_age_months smallint not null,
  goal_tr text not null,
  materials_tr text[] not null default '{}',
  duration_minutes smallint not null,
  steps_tr text[] not null default '{}',
  parent_tips_tr text[] not null default '{}'
);

create table monthly_report (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references child(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  generated_at timestamptz not null default now(),
  payload jsonb not null,
  unique (child_id, period_start)
);

create table school_readiness_assessment (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references child(id) on delete cascade,
  assessed_on date not null,
  payload jsonb not null
);

insert into development_area(id, code, name_tr, sort_order) values
 (1,'sosyal','Sosyal-duygusal gelişim',1),
 (2,'dil','Dil ve iletişim',2),
 (3,'dikkat','Dikkat ve yönerge takibi',3),
 (4,'ince','İnce motor becerileri',4),
 (5,'kaba','Kaba motor becerileri',5),
 (6,'bilis','Bilişsel gelişim',6),
 (7,'ozbakim','Öz bakım ve bağımsızlık',7),
 (8,'oyun','Oyun becerileri',8),
 (9,'duygu','Duygusal düzenleme',9);
