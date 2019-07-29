/* Replace with your SQL commands */

create table users (
  id serial not null primary key,
  name text not null,
  age integer not null,
  created_at timestamp not null default current_timestamp,
  update_at timestamp not null default current_timestamp
);

create index idx_users_id on users (
  name
);

create table posts (
  id serial not null primary key,
  posted_by integer references users(id),
  title text not null,
  body text not null,
  posted_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp,
  edited_by integer references users(id)
);

create index idx_posts_title on posts (
  title,
  body
);