-- Create 4 active offers with MRP + discount + sale price
INSERT INTO offers (id, name, label, plan_id, mrp, discount_percent, sale_price, start_at, end_at, status, created_by)
VALUES ('off_m1_entry', 'Entry Plan Offer', 'SPECIAL PRICE', 'one_month', 29900, 33, 19900, '2026-08-24T00:00:00Z', '2026-12-31T23:59:59Z', 'active', 'system');

INSERT INTO offers (id, name, label, plan_id, mrp, discount_percent, sale_price, start_at, end_at, status, created_by)
VALUES ('off_m3_best', 'Best Value Offer', '⭐ BEST VALUE', 'three_month', 79900, 38, 49900, '2026-08-24T00:00:00Z', '2026-12-31T23:59:59Z', 'active', 'system');

INSERT INTO offers (id, name, label, plan_id, mrp, discount_percent, sale_price, start_at, end_at, status, created_by)
VALUES ('off_m6_popular', 'Most Popular Offer', '🔥 MOST POPULAR', 'six_month', 129900, 46, 69900, '2026-08-24T00:00:00Z', '2026-12-31T23:59:59Z', 'active', 'system');

INSERT INTO offers (id, name, label, plan_id, mrp, discount_percent, sale_price, start_at, end_at, status, created_by)
VALUES ('off_y1_saving', 'Best Saving Offer', '🏆 BEST SAVING', 'one_year', 199900, 50, 99900, '2026-08-24T00:00:00Z', '2026-12-31T23:59:59Z', 'active', 'system');
