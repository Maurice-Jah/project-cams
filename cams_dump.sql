--
-- PostgreSQL database dump
--

\restrict xcivB71RSXxDhykvwpv7IAr6fOjdr0NxLheAsUnAfHENhAQl0dihMgxxXav1aYZ

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: case_notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.case_notes (
    id integer NOT NULL,
    case_id integer NOT NULL,
    content text NOT NULL,
    author_name text DEFAULT 'Unknown'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: case_notes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.case_notes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: case_notes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.case_notes_id_seq OWNED BY public.case_notes.id;


--
-- Name: cases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cases (
    id integer NOT NULL,
    case_number text NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    priority text DEFAULT 'medium'::text NOT NULL,
    abuse_type text NOT NULL,
    description text,
    reported_at timestamp with time zone DEFAULT now() NOT NULL,
    closed_at timestamp with time zone,
    child_id integer,
    worker_id integer,
    report_id integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    referred_to_law_enforcement boolean DEFAULT false NOT NULL,
    referral_agency text,
    referral_contact text,
    referral_reference_number text,
    referred_at timestamp with time zone
);


--
-- Name: cases_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cases_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cases_id_seq OWNED BY public.cases.id;


--
-- Name: children; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.children (
    id integer NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    date_of_birth date NOT NULL,
    gender text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    address text,
    guardian_name text,
    guardian_phone text,
    school_name text,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: children_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.children_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: children_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.children_id_seq OWNED BY public.children.id;


--
-- Name: investigations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.investigations (
    id integer NOT NULL,
    case_id integer NOT NULL,
    worker_id integer,
    status text DEFAULT 'open'::text NOT NULL,
    started_at date NOT NULL,
    completed_at date,
    findings text DEFAULT ''::text NOT NULL,
    outcome text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: investigations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.investigations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: investigations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.investigations_id_seq OWNED BY public.investigations.id;


--
-- Name: password_resets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_resets (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token_hash text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: password_resets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.password_resets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: password_resets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.password_resets_id_seq OWNED BY public.password_resets.id;


--
-- Name: reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reports (
    id integer NOT NULL,
    reporter_name text NOT NULL,
    reporter_type text DEFAULT 'anonymous'::text NOT NULL,
    reporter_phone text,
    reporter_email text,
    abuse_type text NOT NULL,
    description text NOT NULL,
    child_first_name text,
    child_last_name text,
    child_age integer,
    incident_location text,
    incident_date date,
    status text DEFAULT 'new'::text NOT NULL,
    reported_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: reports_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reports_id_seq OWNED BY public.reports.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    role text DEFAULT 'staff'::text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: workers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workers (
    id integer NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    phone text,
    role text DEFAULT 'social_worker'::text NOT NULL,
    department text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id integer
);


--
-- Name: workers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.workers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: workers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.workers_id_seq OWNED BY public.workers.id;


--
-- Name: case_notes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.case_notes ALTER COLUMN id SET DEFAULT nextval('public.case_notes_id_seq'::regclass);


--
-- Name: cases id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cases ALTER COLUMN id SET DEFAULT nextval('public.cases_id_seq'::regclass);


--
-- Name: children id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.children ALTER COLUMN id SET DEFAULT nextval('public.children_id_seq'::regclass);


--
-- Name: investigations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investigations ALTER COLUMN id SET DEFAULT nextval('public.investigations_id_seq'::regclass);


--
-- Name: password_resets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_resets ALTER COLUMN id SET DEFAULT nextval('public.password_resets_id_seq'::regclass);


--
-- Name: reports id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports ALTER COLUMN id SET DEFAULT nextval('public.reports_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: workers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workers ALTER COLUMN id SET DEFAULT nextval('public.workers_id_seq'::regclass);


--
-- Data for Name: case_notes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.case_notes (id, case_id, content, author_name, created_at) FROM stdin;
\.


--
-- Data for Name: cases; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cases (id, case_number, status, priority, abuse_type, description, reported_at, closed_at, child_id, worker_id, report_id, created_at, updated_at, referred_to_law_enforcement, referral_agency, referral_contact, referral_reference_number, referred_at) FROM stdin;
1	CASE-0001	open	critical	physical	Beating	2026-07-09 08:44:40.260162+01	\N	\N	\N	\N	2026-07-09 08:44:40.260162+01	2026-07-09 08:44:40.260162+01	f	\N	\N	\N	\N
2	CASE-0002	open	high	sexual	Filed from report #1 by Blessing: I was sexually abused	2026-07-10 08:34:33.038765+01	\N	\N	1	1	2026-07-10 08:34:33.038765+01	2026-07-10 08:34:33.038765+01	f	\N	\N	\N	\N
\.


--
-- Data for Name: children; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.children (id, first_name, last_name, date_of_birth, gender, status, address, guardian_name, guardian_phone, school_name, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: investigations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.investigations (id, case_id, worker_id, status, started_at, completed_at, findings, outcome, created_at, updated_at) FROM stdin;
1	1	1	open	2026-07-09	\N	Nothing yet	\N	2026-07-09 08:46:36.684347+01	2026-07-09 08:46:36.684347+01
3	1	\N	open	2026-07-09	\N		\N	2026-07-09 13:55:06.330317+01	2026-07-09 13:55:06.330317+01
\.


--
-- Data for Name: password_resets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.password_resets (id, user_id, token_hash, expires_at, used_at, created_at) FROM stdin;
\.


--
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reports (id, reporter_name, reporter_type, reporter_phone, reporter_email, abuse_type, description, child_first_name, child_last_name, child_age, incident_location, incident_date, status, reported_at, created_at, updated_at) FROM stdin;
1	Blessing	anonymous			sexual	I was sexually abused	Emma	Don	17	Lagos	2026-07-08	escalated	2026-07-09 08:47:39.643342+01	2026-07-09 08:47:39.643342+01	2026-07-10 08:34:33.246743+01
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, name, email, password_hash, role, status, created_at, updated_at) FROM stdin;
4	Onyinye 	mauricejah@gmail.com	$2y$10$kTGhLoQbnCRUpgAmmEHZ2O9LcVIgeLXHbrd6GaNEg/W1ZRPWk92bq	staff	active	2026-07-09 08:37:42.138843+01	2026-07-09 08:37:53.406552+01
1	Jah	mauricejahwizwid@gmail.com	$2y$10$2J/U5Ja8fmyR4D.QstAOCO7wharhOBnVaXnQluxU56BfZSNEkcsqu	admin	active	2026-07-09 08:32:27.126842+01	2026-07-10 19:47:50.993705+01
\.


--
-- Data for Name: workers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.workers (id, first_name, last_name, email, phone, role, department, status, created_at, updated_at, user_id) FROM stdin;
1	Onyinye	Jah	mauricejah@gmail.com	08161803849	investigator	Health	active	2026-07-09 08:46:03.081239+01	2026-07-09 08:46:03.081239+01	\N
\.


--
-- Name: case_notes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.case_notes_id_seq', 1, false);


--
-- Name: cases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cases_id_seq', 2, true);


--
-- Name: children_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.children_id_seq', 1, false);


--
-- Name: investigations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.investigations_id_seq', 3, true);


--
-- Name: password_resets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.password_resets_id_seq', 1, false);


--
-- Name: reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reports_id_seq', 1, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- Name: workers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.workers_id_seq', 1, true);


--
-- Name: case_notes case_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.case_notes
    ADD CONSTRAINT case_notes_pkey PRIMARY KEY (id);


--
-- Name: cases cases_case_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_case_number_key UNIQUE (case_number);


--
-- Name: cases cases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_pkey PRIMARY KEY (id);


--
-- Name: children children_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.children
    ADD CONSTRAINT children_pkey PRIMARY KEY (id);


--
-- Name: investigations investigations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investigations
    ADD CONSTRAINT investigations_pkey PRIMARY KEY (id);


--
-- Name: password_resets password_resets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_pkey PRIMARY KEY (id);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: workers workers_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workers
    ADD CONSTRAINT workers_email_key UNIQUE (email);


--
-- Name: workers workers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workers
    ADD CONSTRAINT workers_pkey PRIMARY KEY (id);


--
-- Name: case_notes case_notes_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.case_notes
    ADD CONSTRAINT case_notes_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(id);


--
-- Name: cases cases_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id);


--
-- Name: cases cases_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.reports(id);


--
-- Name: cases cases_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.workers(id);


--
-- Name: investigations investigations_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investigations
    ADD CONSTRAINT investigations_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(id);


--
-- Name: investigations investigations_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investigations
    ADD CONSTRAINT investigations_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.workers(id);


--
-- Name: password_resets password_resets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: workers workers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workers
    ADD CONSTRAINT workers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict xcivB71RSXxDhykvwpv7IAr6fOjdr0NxLheAsUnAfHENhAQl0dihMgxxXav1aYZ

