exports.up = knex => knex.raw(`
  create table "comment" (
    id bigserial primary key,
    parent_id bigint references "comment" (id)
      on update cascade on delete restrict,
    "comment" text not null,
    ip_address text not null,
    created_at timestamptz not null default now()
  );

`);

exports.down = function(knex, Promise) {
  
};
