-- 1. USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'CLIENT' CHECK (role IN ('CLIENT', 'AGENT')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TICKETS TABLE
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (
        status IN (
            'OPEN',
            'IN_PROGRESS',
            'RESOLVED',
            'CLOSED'
        )
    ),
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM' CHECK (
        priority IN ('LOW', 'MEDIUM', 'HIGH')
    ),
    created_by_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    assigned_to_id UUID REFERENCES users (id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. COMMENTS TABLE
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    ticket_id UUID NOT NULL REFERENCES tickets (id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_internal BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. INDEXES FOR PERFORMANCE OPTIMIZATION
CREATE INDEX idx_tickets_created_by ON tickets (created_by_id);

CREATE INDEX idx_tickets_assigned_to ON tickets (assigned_to_id);

CREATE INDEX idx_comments_ticket_id ON comments (ticket_id);