create extension if not exists pgcrypto;

create table if not exists payment_intents (
  id uuid primary key default gen_random_uuid(),
  payer_address text not null,
  chain_id bigint not null,
  receiver_address text not null,
  amount_wei numeric(78,0) not null,
  status text not null default 'pending',
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  intent_id uuid not null references payment_intents(id) on delete cascade,
  tx_hash text not null unique,
  payer_address text not null,
  receiver_address text not null,
  amount_wei numeric(78,0) not null,
  chain_id bigint not null,
  confirmations int not null,
  status text not null,
  confirmed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists pro_wallets (
  wallet_address text primary key,
  is_pro boolean not null default false,
  pro_since timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists idx_payment_intents_payer on payment_intents(payer_address);
create index if not exists idx_payments_intent on payments(intent_id);
create index if not exists idx_pro_wallets_is_pro on pro_wallets(is_pro);
