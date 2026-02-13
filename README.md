# 🏀 HoopEdge - Basketball Analytics Platform

A professional basketball analytics platform with subscription-based access to advanced statistics, odds analysis, and matchup predictions.

## ✨ Features

### Free Tier
- Team performance charts and tables
- Home & away statistics
- Last N games filtering
- Basic halftime analytics

### Pro Tier 🔥
- **Odds Analysis** - Distribution charts and team recurrence patterns
- **Matchup Analyzer** - Head-to-head predictions with historical data
- Unlimited league access
- Full historical game data
- Priority support

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Better Auth
- **Payments**: 
  - Stripe (International)
  - Paystack (Nigeria)
- **UI**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **Styling**: Lucide Icons


## 🧪 Testing Payments

### Stripe (International)

1. **Use test card**
```
Card: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

### Paystack (Nigeria)

**Test Card:**
```
Card: 5060 6666 6666 6666 666
CVV: 123
PIN: 1234
OTP: 123456
```

## 🔐 Authentication Flow

1. User signs up with email/password
2. Email verification sent
3. User verifies email
4. Access granted to free tier
5. User can upgrade to Pro via Stripe/Paystack
6. Or signIn with google

## 📧 Support

For issues or questions:
- Open a GitHub issue
- Contact: https://x.com/Its__Muze

## 🙏 Acknowledgments

- Basketball data providers
- Stripe & Paystack for payment processing
- shadcn/ui for beautiful components
- Etc

---

**Built with ❤️ for basketball analytics enthusiasts**