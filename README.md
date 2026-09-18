# Players' Union

Amenity slot booking for Masters' Union — pick an amenity (Gym, Music Rooms,
Dance Room, Pickleball Court), see a 30-minute slot calendar, and book or join
the waiting list. XP shown top-right (currently a flat 100, no login yet
— that's coming later once it's linked to sign-up).

Runs out of the box with sample data, so you can deploy and share a link today.
See **[DEPLOY.md](./DEPLOY.md)** for the very basic step-by-step Vercel deploy guide.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## What's here

- `/` — amenity grid (Gym is the large card, Music Room 1 & 2, Dance Room,
  Pickleball Court are the smaller ones)
- `/amenities/[slug]` — 30-minute slot calendar for that amenity, grouped by
  peak window (06:00–09:00, 12:30–14:00, 17:00–22:00). Click a slot to see
  who's confirmed, who's waiting, and to book / join the waiting list /
  cancel your own booking
- `supabase/schema.sql` — database schema, ready for when login and real
  bookings are wired in

## Swapping in the real logo

The logo is wired in at `public/logo.png`, and the XP token icon at
`public/xp-token.png` — see step 5 in [DEPLOY.md](./DEPLOY.md) if you ever
need to swap either.
