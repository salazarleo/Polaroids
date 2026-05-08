alter table public.orders
  add column if not exists customer_email text;

comment on column public.orders.customer_email is
  'Customer email captured at checkout for delivery notifications.';
