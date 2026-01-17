-- TktResell Initial Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    phone TEXT NOT NULL,
    full_name TEXT,
    is_verified_seller BOOLEAN DEFAULT FALSE,
    bank_account_last4 TEXT,
    reputation_score INTEGER DEFAULT 50 CHECK (reputation_score >= 0 AND reputation_score <= 100),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tickets table
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    event_name TEXT NOT NULL,
    event_date TIMESTAMPTZ NOT NULL,
    venue TEXT NOT NULL,
    original_price DECIMAL(10, 2) NOT NULL CHECK (original_price >= 0),
    asking_price DECIMAL(10, 2) NOT NULL CHECK (asking_price >= 0),
    ticket_type TEXT NOT NULL DEFAULT 'General',
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
    ticket_proof_url TEXT,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'pending', 'sold', 'disputed', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    platform_fee DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (platform_fee >= 0),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'held', 'released', 'refunded')),
    payment_provider_id TEXT,
    escrow_release_at TIMESTAMPTZ,
    seller_bank_details TEXT,
    payment_proof_url TEXT,
    seller_confirmed BOOLEAN DEFAULT FALSE,
    ticket_sent BOOLEAN DEFAULT FALSE,
    ticket_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disputes table
CREATE TABLE IF NOT EXISTS public.disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    reporter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL CHECK (reason IN ('ticket_invalid', 'wrong_ticket', 'seller_no_show', 'other')),
    description TEXT NOT NULL,
    evidence_urls TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved_buyer', 'resolved_seller')),
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Seller Verifications table
CREATE TABLE IF NOT EXISTS public.seller_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    verification_type TEXT NOT NULL CHECK (verification_type IN ('bank_link', 'id_document', 'phone')),
    verification_data TEXT, -- Encrypted or hashed data
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table (for buyer-seller communication)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tickets_seller_id ON public.tickets(seller_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_event_date ON public.tickets(event_date);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON public.tickets(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON public.transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller_id ON public.transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_ticket_id ON public.transactions(ticket_id);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_status ON public.transactions(payment_status);

CREATE INDEX IF NOT EXISTS idx_disputes_transaction_id ON public.disputes(transaction_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON public.disputes(status);

CREATE INDEX IF NOT EXISTS idx_messages_transaction_id ON public.messages(transaction_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all profiles" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Tickets policies
CREATE POLICY "Anyone can view available tickets" ON public.tickets
    FOR SELECT USING (status = 'available' OR seller_id = auth.uid());

CREATE POLICY "Authenticated users can create tickets" ON public.tickets
    FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update own tickets" ON public.tickets
    FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete own tickets" ON public.tickets
    FOR DELETE USING (auth.uid() = seller_id AND status = 'available');

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Authenticated users can create transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Transaction participants can update" ON public.transactions
    FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Disputes policies
CREATE POLICY "Transaction participants can view disputes" ON public.disputes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.transactions t
            WHERE t.id = transaction_id
            AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())
        )
    );

CREATE POLICY "Transaction participants can create disputes" ON public.disputes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.transactions t
            WHERE t.id = transaction_id
            AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())
        )
        AND auth.uid() = reporter_id
    );

-- Seller Verifications policies
CREATE POLICY "Users can view own verifications" ON public.seller_verifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own verifications" ON public.seller_verifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Transaction participants can view messages" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.transactions t
            WHERE t.id = transaction_id
            AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())
        )
    );

CREATE POLICY "Transaction participants can send messages" ON public.messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.transactions t
            WHERE t.id = transaction_id
            AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())
        )
        AND auth.uid() = sender_id
    );

-- Functions

-- Function to automatically update ticket status when transaction is created
CREATE OR REPLACE FUNCTION update_ticket_status_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.tickets
    SET status = 'pending'
    WHERE id = NEW.ticket_id AND status = 'available';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for the function
DROP TRIGGER IF EXISTS on_transaction_created ON public.transactions;
CREATE TRIGGER on_transaction_created
    AFTER INSERT ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_ticket_status_on_transaction();

-- Function to update seller reputation
CREATE OR REPLACE FUNCTION update_seller_reputation()
RETURNS TRIGGER AS $$
DECLARE
    total_transactions INTEGER;
    successful_transactions INTEGER;
    new_score INTEGER;
BEGIN
    IF NEW.payment_status = 'released' AND OLD.payment_status != 'released' THEN
        -- Count total and successful transactions for seller
        SELECT COUNT(*), COUNT(*) FILTER (WHERE payment_status = 'released')
        INTO total_transactions, successful_transactions
        FROM public.transactions
        WHERE seller_id = NEW.seller_id;

        -- Calculate new reputation score (base 50, max 100)
        IF total_transactions > 0 THEN
            new_score := 50 + (successful_transactions::FLOAT / total_transactions * 50)::INTEGER;

            UPDATE public.users
            SET reputation_score = new_score
            WHERE id = NEW.seller_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for reputation update
DROP TRIGGER IF EXISTS on_transaction_completed ON public.transactions;
CREATE TRIGGER on_transaction_completed
    AFTER UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_seller_reputation();

-- Function to handle user creation from auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, phone, email, reputation_score, is_verified_seller)
    VALUES (
        NEW.id,
        COALESCE(NEW.phone, ''),
        NEW.email,
        50,
        FALSE
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
