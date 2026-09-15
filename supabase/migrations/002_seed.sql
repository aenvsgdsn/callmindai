-- ============================================================
-- CallMind AI — Realistic Seed Data
-- Run AFTER 001_schema.sql in Supabase SQL Editor
-- ============================================================

-- Agency
INSERT INTO agencies (id, name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'CallMind Demo Agency')
ON CONFLICT (id) DO NOTHING;

-- Users (password_hash = bcrypt of "admin123")
INSERT INTO users (id, agency_id, name, email, password_hash, role) VALUES
  ('00000000-0000-0000-0000-000000000010',
   '00000000-0000-0000-0000-000000000001',
   'Alex Johnson', 'admin@callmind.ai',
   '$2b$12$03INydBRKRwdy9i5COLiS.NWVK68Gz9Jo7eknqlQxq7KOdl8L4vsS',
   'agency_admin'),
  ('00000000-0000-0000-0000-000000000011',
   '00000000-0000-0000-0000-000000000001',
   'Maria Lee', 'maria@callmind.ai',
   '$2b$12$03INydBRKRwdy9i5COLiS.NWVK68Gz9Jo7eknqlQxq7KOdl8L4vsS',
   'sales_manager')
ON CONFLICT (email) DO NOTHING;

-- Leads
INSERT INTO leads (id, agency_id, name, phone, email, source, intent, status, budget, location) VALUES
  ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001',
   'Sarah Mitchell','+14155550101','sarah.m@gmail.com','website','buy','qualified','$650,000–$800,000','San Francisco, CA'),
  ('10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001',
   'James Okafor','+14155550102','james.okafor@outlook.com','referral','rent','engaging',NULL,'Oakland, CA'),
  ('10000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000001',
   'Priya Sharma','+14155550103','priya.sharma@yahoo.com','cold_call','invest','reviewing','$1.2M+','Palo Alto, CA'),
  ('10000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000001',
   'David Chen','+14155550104','david.chen88@gmail.com','website','buy','new',NULL,'San Jose, CA'),
  ('10000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000001',
   'Emma Rodriguez','+14155550105','emma.r@hotmail.com','referral','sell','converted','$420,000','Fremont, CA'),
  ('10000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000001',
   'Michael Torres','+14155550106',NULL,'website','buy','engaging',NULL,'Berkeley, CA'),
  ('10000000-0000-0000-0000-000000000007','00000000-0000-0000-0000-000000000001',
   'Aisha Patel','+14155550107','aisha.p@gmail.com','cold_call','rent','new',NULL,'Daly City, CA'),
  ('10000000-0000-0000-0000-000000000008','00000000-0000-0000-0000-000000000001',
   'Robert Kim','+14155550108','robert.kim@company.com','website','invest','human-required','$900,000+','Mountain View, CA')
ON CONFLICT (id) DO NOTHING;

-- Qualification Strategies
INSERT INTO qualification_strategies (id, agency_id, lead_id, objective, questions, status, approved_by) VALUES
  ('20000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000001',
   'Qualify Sarah for a 3-bed SF property purchase under $800K. Confirm pre-approval status and preferred neighbourhoods.',
   '["Are you currently pre-approved for a mortgage?","What''s your ideal move-in timeline?","Are you flexible on neighbourhood — Noe Valley vs. Mission District?","Do you require parking or outdoor space?","Have you worked with a buyer''s agent before?"]',
   'approved',
   '00000000-0000-0000-0000-000000000010'),
  ('20000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000002',
   'Determine James''s rental budget and urgency. He is relocating for work — identify if he needs furnished options.',
   '["What is your monthly rental budget?","When do you need to move in by?","Do you require a furnished apartment?","How many bedrooms do you need?","Are you open to a 6-month lease?"]',
   'pending',
   NULL),
  ('20000000-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000003',
   'Evaluate Priya''s investment goals. Multi-unit or commercial focus? Identify if she has existing portfolio.',
   '["Are you looking at residential multi-unit or commercial properties?","What ROI percentage are you targeting?","Do you have an existing real estate portfolio?","Are you investing through an LLC or personally?","What is your preferred hold period — 5 or 10+ years?"]',
   'pending',
   NULL),
  ('20000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000008',
   'High-value investor lead flagged for human review. Complex requirements. Needs senior agent assignment.',
   '["What type of investment property are you targeting?","Do you need 1031 exchange assistance?","Are you working with a financial advisor on this acquisition?"]',
   'rejected',
   '00000000-0000-0000-0000-000000000011')
ON CONFLICT (id) DO NOTHING;

-- Conversations with REAL multi-turn messages
INSERT INTO conversations (id, agency_id, lead_id, channel, status, sentiment, ai_handled, messages, updated_at) VALUES
  ('30000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000001',
   'SMS', 'active', 'positive', TRUE,
   '[
     {"from":"ai","text":"Hi Sarah! This is Alex from CallMind Realty. I saw you were browsing 3-bed properties in the SF area. I''d love to help you find the perfect home. Are you currently pre-approved for a mortgage?","ts":"2026-09-12T09:00:00Z"},
     {"from":"lead","text":"Yes! We got pre-approved last week for up to $780K. Very excited to start looking!","ts":"2026-09-12T09:04:22Z"},
     {"from":"ai","text":"That''s fantastic news, Sarah! $780K opens up some beautiful options in Noe Valley and the Inner Sunset. Do you have a preferred move-in timeline?","ts":"2026-09-12T09:04:45Z"},
     {"from":"lead","text":"We''re hoping to move by end of November ideally. Our lease is up Dec 1st.","ts":"2026-09-12T09:06:10Z"},
     {"from":"ai","text":"Perfect — that''s very achievable. I''ll put together a curated list of available properties that match your criteria. Do you need parking? And would you consider the Mission District or strictly Noe Valley?","ts":"2026-09-12T09:06:30Z"},
     {"from":"lead","text":"Parking would be great but not a deal breaker. Open to Mission District too — we love the restaurants there!","ts":"2026-09-12T09:08:45Z"},
     {"from":"ai","text":"Love that! I''ll include some Mission options too. I''m going to schedule a call with our senior agent Alex to walk you through the shortlist. Would Thursday at 2 PM or Friday at 10 AM work for you?","ts":"2026-09-12T09:09:00Z"},
     {"from":"lead","text":"Friday at 10 AM works perfectly!","ts":"2026-09-12T09:10:30Z"},
     {"from":"ai","text":"Booked! You''ll receive a confirmation shortly. Looking forward to finding your dream home, Sarah!","ts":"2026-09-12T09:10:45Z"}
   ]'::jsonb,
   NOW() - INTERVAL '2 hours'),

  ('30000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000002',
   'Email', 'active', 'neutral', TRUE,
   '[
     {"from":"ai","text":"Hi James, I''m reaching out from CallMind Realty following your inquiry about Oakland rentals. We have some great options available. Could you share your monthly budget and how many bedrooms you need?","ts":"2026-09-13T10:00:00Z"},
     {"from":"lead","text":"Hi! Looking for a 2-bed around $2,500/month. I''m relocating for a job at a tech company in San Francisco. Need something commuter-friendly.","ts":"2026-09-13T11:15:00Z"},
     {"from":"ai","text":"Welcome to the Bay Area, James! A 2-bed at $2,500 in Oakland with BART access is very doable. Areas like Temescal, Rockridge, or Grand Lake would give you a quick commute to SF. Do you need the unit furnished or unfurnished?","ts":"2026-09-13T11:20:00Z"},
     {"from":"lead","text":"Unfurnished is fine, I''ll be shipping my stuff. When would be the earliest I could move in?","ts":"2026-09-13T14:30:00Z"},
     {"from":"ai","text":"We have units available from October 1st. Would you be open to a virtual tour this week so we can shortlist the best options before you fly in?","ts":"2026-09-13T14:32:00Z"},
     {"from":"lead","text":"Yes absolutely, virtual tour would be perfect. I''m in Chicago right now.","ts":"2026-09-13T15:00:00Z"}
   ]'::jsonb,
   NOW() - INTERVAL '5 hours'),

  ('30000000-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000003',
   'Voice', 'human-required', 'positive', FALSE,
   '[
     {"from":"ai","text":"Hello Priya, thank you for your interest in investment properties in the Palo Alto area. I understand you''re looking at a $1.2M+ range. Could you tell me more about your investment strategy?","ts":"2026-09-11T14:00:00Z"},
     {"from":"lead","text":"Yes, I''m looking at multi-unit residential — ideally a 4-6 unit building. I have an existing portfolio of 3 properties. Targeting 6%+ cap rate.","ts":"2026-09-11T14:02:00Z"},
     {"from":"ai","text":"Excellent — a 4-6 unit in Palo Alto at that price point is competitive but we do have leads on a few off-market listings. Are you investing personally or through an LLC?","ts":"2026-09-11T14:02:30Z"},
     {"from":"lead","text":"Through my LLC — Sharma Capital LLC. I''d also want to explore 1031 exchange options from a recent sale.","ts":"2026-09-11T14:04:00Z"},
     {"from":"ai","text":"I''m escalating this to our senior investment specialist Maria Lee — she handles 1031 exchanges and has off-market multi-unit access. She''ll reach out within the hour.","ts":"2026-09-11T14:04:30Z"},
     {"from":"human","text":"Hi Priya, this is Maria. I''ve reviewed your requirements and I''m preparing a detailed off-market dossier for you. I''ll have it ready by tomorrow morning — does a call at 9 AM Friday work?","ts":"2026-09-11T14:45:00Z"},
     {"from":"lead","text":"Perfect, Friday 9 AM works. Please send the dossier beforehand so I can review.","ts":"2026-09-11T15:00:00Z"}
   ]'::jsonb,
   NOW() - INTERVAL '30 minutes'),

  ('30000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000004',
   'SMS', 'active', 'neutral', TRUE,
   '[
     {"from":"ai","text":"Hi David! We noticed you were browsing 3-bed homes in San Jose. Are you looking to buy or rent?","ts":"2026-09-14T08:00:00Z"},
     {"from":"lead","text":"Buy! First-time buyer here. Not sure where to start honestly.","ts":"2026-09-14T08:15:00Z"},
     {"from":"ai","text":"Welcome! Don''t worry — we guide first-time buyers through every step. The best starting point is knowing your budget. Have you spoken to a lender about pre-approval yet?","ts":"2026-09-14T08:16:00Z"},
     {"from":"lead","text":"Not yet. How important is that?","ts":"2026-09-14T08:20:00Z"},
     {"from":"ai","text":"It''s the most important first step! Pre-approval tells you exactly what you can afford and makes your offer competitive. I can connect you with our trusted lender partner who can get you pre-approved within 24 hours. Interested?","ts":"2026-09-14T08:20:30Z"},
     {"from":"lead","text":"Yes that would be really helpful, thank you!","ts":"2026-09-14T08:22:00Z"}
   ]'::jsonb,
   NOW() - INTERVAL '1 hour')
ON CONFLICT (id) DO NOTHING;

-- Appointments
INSERT INTO appointments (id, agency_id, lead_id, scheduled_at, duration_minutes, appointment_type, property_address, status, notes) VALUES
  ('40000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000001',
   NOW() + INTERVAL '3 days',
   60, 'Property Viewing',
   '1847 Castro St, San Francisco, CA 94131',
   'confirmed',
   'Sarah is pre-approved up to $780K. Show 3-bed options only. Parking a plus.'),
  ('40000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000003',
   NOW() + INTERVAL '1 day',
   90, 'Investment Review',
   NULL,
   'confirmed',
   'Priya is evaluating multi-unit Palo Alto. Has LLC. 1031 exchange interest. Maria to lead call.'),
  ('40000000-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000005',
   NOW() - INTERVAL '5 days',
   45, 'Contract Signing',
   '3421 Fremont Blvd, Fremont, CA 94538',
   'completed',
   'Emma sold her Fremont property. Deal closed at $418,500.')
ON CONFLICT (id) DO NOTHING;
