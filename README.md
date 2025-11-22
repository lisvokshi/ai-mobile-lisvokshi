# Mood Journal App (React Native + Supabase)

A mobile-friendly **Mood Journal** application built with **Expo (React Native)** and **Supabase**.  
The app lets a student select a date, write a mood note, automatically classify the mood (mock “AI”), and store everything in a Supabase database.  
This project is implemented for the *Mobile Applications* course assignment (Topic 14).

---

## 📱 Main Features

- **Date Picker**  
  - Choose a date with `@react-native-community/datetimepicker`  
  - Selected date stays visible after selection

- **Mood Note Input**  
  - Text field for describing the mood  
  - Empty notes are blocked with a validation message

- **Sentiment / Mood Classification (Mock AI)**  
  - Local function checks keywords and returns a mood category, for example:  
    - `happy`, `good`, `great`, `excited`, `grateful` → **positive**  
    - `sad`, `angry`, `bad`, `tired`, `stressed`, `anxious`, `afraid` → **negative**  
    - other text → **neutral**
  - If the text contains **more than one mood category at the same time**, the app shows an alert and does **not** save the note (forces one main mood).

- **Supabase Integration**  
  - Saves each entry to a `moods` table in Supabase  
  - Columns: `id`, `dt`, `note`, `sentiment`, `user_id`  
  - Uses the public `anon` key with Row Level Security (RLS) policies

- **Mood History**  
  - Reads all records from Supabase and shows them in a list  
  - Each item displays: date, note, sentiment  
  - Color-coded background per sentiment:
    - Positive → light green  
    - Negative → light red  
    - Neutral → light gray

- **Light Theme UI**  
  - Simple, clean, light background so text and colors are easy to read

---

## 🛠️ Tech Stack

- **Frontend:** React Native (Expo Snack)  
- **Backend:** Supabase (PostgreSQL + REST API)  
- **Language:** JavaScript (ES6)  
- **Other:**  
  - `@react-native-community/datetimepicker` for date selection  
  - Fetch-based Supabase client via `@supabase/supabase-js`

---

## 📂 Project Structure

```text
/ (root)
 ├── App.js                # Main React Native application
 ├── supabaseClient.js     # Supabase client configuration
 ├── package.json          # Dependencies for Expo Snack
 ├── README.md             # Project documentation (this file)
 └── AI-log.txt (optional) # Log of AI / ChatGPT prompts used
