**✅ Complete & Beautiful README.md for Full Project (Client + Server)**

```markdown
# RenNest - Rental House Platform (Full Stack)

A modern, full-featured **rental property marketplace** built with **Next.js 16** (frontend) and **Express.js + MongoDB** (backend). It includes role-based dashboards, property management, secure bookings, and Stripe payments.

![RenNest Banner](https://via.placeholder.com/1200x400/1a2338/ffffff?text=RenNest+-+Modern+Rental+Platform)

---

## 🌟 Key Features

- **Role-based Dashboards**: Organizer, Attendee, and Admin
- **Property Management**: Add, edit, delete, and browse properties
- **Advanced Search & Filters**: By title, category, and location
- **Secure Bookings & Payments**: Powered by Stripe
- **Premium Subscription**: Unlimited property hosting for organizers
- **Authentication**: Email/password + Google OAuth via Better Auth
- **Modern UI**: Dark theme with smooth animations

---

## 🛠 Tech Stack

### Frontend (Client)
| Technology         | Purpose                        |
|--------------------|--------------------------------|
| Next.js 16         | React Framework                |
| Tailwind CSS       | Styling                        |
| HeroUI             | UI Components                  |
| Framer Motion      | Animations                     |
| React Hook Form    | Forms                          |

### Backend (Server)
| Technology         | Purpose                        |
|--------------------|--------------------------------|
| Express.js         | Backend Framework              |
| MongoDB            | Database                       |
| Better Auth        | Authentication & JWT           |
| Stripe             | Payments & Subscriptions       |
| CORS + dotenv      | Security & Environment         |

---

## 📁 Project Structure

```
RenNest/
├── rental-house-client-main/     # Frontend (Next.js)
│   ├── src/
│   │   ├── app/                  # Pages & Routes
│   │   ├── components/           # Reusable UI
│   │   ├── dashboard/            # Role-based dashboards
│   │   └── lib/                  # API calls & Auth
│   └── public/
│
├── Rental-House-Server-main/     # Backend (Express)
│   ├── index.js                  # Main server file
│   ├── vercel.json               # Deployment config
│   └── package.json
```

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd RenNest
```

### 2. Setup Frontend (Client)
```bash
cd rental-house-client-main
npm install
```

Create `.env.local`:
```env
NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_key
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-secret-key
MOONGO_DB_DATA_BASE=your-mongodb-uri
MOONGO_DB_NAME=House_DB
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

Run:
```bash
npm run dev
# Open: http://localhost:3000
```

### 3. Setup Backend (Server)
```bash
cd ../Rental-House-Server-main
npm install
```

Create `.env`:
```env
MOONGO_DB_DATA_BASE=your-mongodb-connection-string
PORT=5000
```

Run:
```bash
npm start
# Server runs on http://localhost:5000
```

---

## 📌 Scripts

**Frontend:**
```bash
npm run dev      # Development
npm run build    # Production build
npm run start    # Start built app
```

**Backend:**
```bash
npm start        # Start server
```

---

## 🔐 Authentication

- Email + Password
- Google OAuth
- JWT-based sessions with Better Auth
- Role-based access control (Organizer, Attendee, Admin)

---

## 💳 Payment Integration

- Stripe Checkout for bookings
- Premium subscription for organizers (unlimited properties)
- Transaction history for all users

---

## 📊 Database Collections (MongoDB)

- `users` – User accounts & roles
- `organizations` – Organizer profiles
- `events` – Property listings
- `bookings` – Booking records
- `payments` – Payment history
- `session` – Active JWT sessions

---

## 🎨 Design Highlights

- Sleek dark modern theme
- Glassmorphism effects
- Smooth animations with Framer Motion
- Fully responsive (mobile + desktop)
- Professional UI using HeroUI components

---

## 📄 API Routes (Backend)

- `GET /api/events` – Fetch properties with filters
- `POST /api/events` – Add new property
- `POST /api/events/booking` – Book a property
- `PATCH /api/users/upgrade-premium` – Upgrade to premium
- Protected routes with JWT verification

---

## 📝 License

This project is open for **portfolio, learning, and personal use**. Feel free to fork and customize it.

---

## 👨‍💻 Developed By

**RenNest** – A complete full-stack rental solution.

Built with ❤️ using Next.js & Express.

---

**Ready to deploy on Vercel!**

Would you like me to add **screenshots section**, **demo links**, or **contribution guidelines**? Just say the word!
```

This README is now **complete**, **professional**, and covers both frontend and backend beautifully. Let me know if you want any more changes! 🚀