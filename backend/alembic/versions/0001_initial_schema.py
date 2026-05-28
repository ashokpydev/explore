"""initial schema

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-05-27
"""

from alembic import op

revision = "0001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis")
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")
    op.execute(
        """
        DO $$ BEGIN
          CREATE TYPE userrole AS ENUM ('user', 'guide', 'admin');
        EXCEPTION WHEN duplicate_object THEN null; END $$;
        DO $$ BEGIN
          CREATE TYPE placekind AS ENUM (
            'monument', 'lake', 'temple', 'mosque', 'market', 'mall', 'resort',
            'trekking', 'weekend_getaway', 'hidden_gem', 'local_experience'
          );
        EXCEPTION WHEN duplicate_object THEN null; END $$;
        """
    )
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          full_name VARCHAR(160) NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role userrole NOT NULL DEFAULT 'user',
          preferred_language VARCHAR(16) NOT NULL DEFAULT 'en',
          interests JSON NOT NULL DEFAULT '[]',
          is_active BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS ix_users_email ON users(email);

        CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(120) UNIQUE NOT NULL,
          slug VARCHAR(140) UNIQUE NOT NULL,
          description TEXT
        );
        CREATE INDEX IF NOT EXISTS ix_categories_slug ON categories(slug);

        CREATE TABLE IF NOT EXISTS places (
          id UUID PRIMARY KEY,
          name VARCHAR(180) NOT NULL,
          slug VARCHAR(220) UNIQUE NOT NULL,
          kind placekind NOT NULL,
          short_description VARCHAR(300) NOT NULL,
          history TEXT NOT NULL,
          address VARCHAR(300) NOT NULL,
          city VARCHAR(100) NOT NULL DEFAULT 'Hyderabad',
          state VARCHAR(100) NOT NULL DEFAULT 'Telangana',
          latitude DOUBLE PRECISION NOT NULL,
          longitude DOUBLE PRECISION NOT NULL,
          location GEOGRAPHY(POINT, 4326),
          timings JSON NOT NULL DEFAULT '{}',
          entry_fee JSON NOT NULL DEFAULT '{}',
          best_time_to_visit VARCHAR(180) NOT NULL,
          accessibility JSON NOT NULL DEFAULT '{}',
          safety JSON NOT NULL DEFAULT '{}',
          ai_tips JSON NOT NULL DEFAULT '[]',
          rating DOUBLE PRECISION NOT NULL DEFAULT 0,
          review_count INTEGER NOT NULL DEFAULT 0,
          is_featured BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS ix_places_name ON places(name);
        CREATE INDEX IF NOT EXISTS ix_places_slug ON places(slug);
        CREATE INDEX IF NOT EXISTS ix_places_kind ON places(kind);
        CREATE INDEX IF NOT EXISTS ix_places_location ON places USING GIST(location);
        CREATE INDEX IF NOT EXISTS ix_places_search ON places USING GIN((name || ' ' || short_description) gin_trgm_ops);

        CREATE TABLE IF NOT EXISTS place_categories (
          place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
          category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
          PRIMARY KEY (place_id, category_id)
        );

        CREATE TABLE IF NOT EXISTS media_assets (
          id UUID PRIMARY KEY,
          place_id UUID REFERENCES places(id) ON DELETE CASCADE,
          url VARCHAR(600) NOT NULL,
          type VARCHAR(40) NOT NULL,
          alt_text VARCHAR(240) NOT NULL,
          ai_tags JSON NOT NULL DEFAULT '[]',
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS restaurants (
          id UUID PRIMARY KEY,
          name VARCHAR(180) NOT NULL,
          cuisine JSON NOT NULL DEFAULT '[]',
          price_band VARCHAR(24) NOT NULL,
          rating DOUBLE PRECISION NOT NULL DEFAULT 0,
          cost_for_two INTEGER NOT NULL,
          address VARCHAR(300) NOT NULL,
          latitude DOUBLE PRECISION NOT NULL,
          longitude DOUBLE PRECISION NOT NULL,
          location GEOGRAPHY(POINT, 4326),
          crowd_level VARCHAR(40) NOT NULL DEFAULT 'moderate',
          open_late BOOLEAN NOT NULL DEFAULT false,
          highlights JSON NOT NULL DEFAULT '[]',
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS ix_restaurants_name ON restaurants(name);
        CREATE INDEX IF NOT EXISTS ix_restaurants_location ON restaurants USING GIST(location);

        CREATE TABLE IF NOT EXISTS events (
          id UUID PRIMARY KEY,
          title VARCHAR(220) NOT NULL,
          event_type VARCHAR(80) NOT NULL,
          description TEXT NOT NULL,
          starts_at TIMESTAMPTZ NOT NULL,
          ends_at TIMESTAMPTZ NOT NULL,
          venue VARCHAR(240) NOT NULL,
          latitude DOUBLE PRECISION NOT NULL,
          longitude DOUBLE PRECISION NOT NULL,
          ticket_price NUMERIC(10, 2),
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS ix_events_title ON events(title);

        CREATE TABLE IF NOT EXISTS reviews (
          id UUID PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
          rating INTEGER NOT NULL,
          body TEXT NOT NULL,
          sentiment VARCHAR(40),
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          CONSTRAINT one_review_per_place_user UNIQUE(user_id, place_id)
        );

        CREATE TABLE IF NOT EXISTS itineraries (
          id UUID PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE SET NULL,
          title VARCHAR(180) NOT NULL,
          trip_type VARCHAR(60) NOT NULL,
          days INTEGER NOT NULL,
          budget_inr INTEGER NOT NULL,
          route JSON NOT NULL DEFAULT '[]',
          ai_reasoning TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS favorites (
          id UUID PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          CONSTRAINT favorite_once UNIQUE(user_id, place_id)
        );

        CREATE TABLE IF NOT EXISTS ai_recommendations (
          id UUID PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE SET NULL,
          intent VARCHAR(160) NOT NULL,
          prompt TEXT NOT NULL,
          response JSON NOT NULL,
          model VARCHAR(80) NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS ix_ai_recommendations_intent ON ai_recommendations(intent);
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DROP TABLE IF EXISTS ai_recommendations;
        DROP TABLE IF EXISTS favorites;
        DROP TABLE IF EXISTS itineraries;
        DROP TABLE IF EXISTS reviews;
        DROP TABLE IF EXISTS events;
        DROP TABLE IF EXISTS restaurants;
        DROP TABLE IF EXISTS media_assets;
        DROP TABLE IF EXISTS place_categories;
        DROP TABLE IF EXISTS places;
        DROP TABLE IF EXISTS categories;
        DROP TABLE IF EXISTS users;
        DROP TYPE IF EXISTS placekind;
        DROP TYPE IF EXISTS userrole;
        """
    )

