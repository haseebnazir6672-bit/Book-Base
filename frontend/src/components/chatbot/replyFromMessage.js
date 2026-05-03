/**
 * Simple rule-based replies for the BookBase assistant (no external API).
 */
export function getBotReply(input, { role } = {}) {
  const t = String(input).toLowerCase().trim()

  if (!t) {
    return 'Ask me about borrowing, logging in, or finding books in BookBase.'
  }

  // Fine-related questions
  if (/return.*late|late.*return|overdue.*fine|fine.*overdue/.test(t)) {
    return 'A fine is charged for each day after the due date until the book is returned.'
  }

  if (/how.*fine.*calculate|calculate.*fine|fine.*calculated/.test(t)) {
    return 'The fine is calculated by multiplying the number of late days by the daily fine rate.'
  }

  if (/fine.*per.*day|per.*day.*fine|daily.*fine/.test(t)) {
    return 'The fine per day is set by the library (e.g., Rs. 10 per day).'
  }

  if (/check.*fine|fine.*amount|view.*fine/.test(t)) {
    return 'You can view your fine in your dashboard under issued or overdue books.'
  }

  if (/pay.*fine|before.*issue|new.*book|clear.*fine/.test(t)) {
    return 'Yes, all pending fines must be cleared before issuing a new book.'
  }

  if (/where.*pay.*fine|pay.*fine.*where|how.*pay.*fine/.test(t)) {
    return 'You can pay your fine at the library counter or through the system if online payment is available.'
  }

  // Knowledge Hub questions
  if (/knowledge.*hub|what.*knowledge.*hub/.test(t)) {
    return 'Knowledge Hub is a platform where students and teachers can upload, share, and explore academic content like projects, research, and notes.'
  }

  if (/borrow|loan|due|overdue/.test(t)) {
    return role === 'student'
      ? 'As a student, open **My Library** from the sidebar, pick a department, then use **Borrow** on a book card. You can confirm on the borrow page. Return books before the due date to avoid overdue status.'
      : 'Students can borrow from **My Library** after signing in. Guests can browse the home page and tap **Borrow** on catalog books—you will be prompted to log in as a student first.'
  }

  if (/login|password|sign|credential|account/.test(t)) {
    return 'Use **Quick Login** on the home page to pick a role, then **Continue to Dashboard**. Demo credentials: **admin** / admin123, **librarian** / lib123, **student** / student123.'
  }

  if (/department|bscs|filter/.test(t)) {
    return 'Students choose a **department** in the library view; book lists filter automatically. You can also search from the top bar when logged in as a student.'
  }

  if (/notif|bell|alert/.test(t)) {
    return 'Click the **bell** in the header to open notifications. You need to be logged in.'
  }

  if (/profile|avatar|photo/.test(t)) {
    return role === 'student'
      ? 'Tap your **profile picture** in the header to open your profile page.'
      : 'Profile shortcuts apply to the student experience after login.'
  }

  if (/librarian|admin/.test(t)) {
    return '**Librarians** manage the catalog from their dashboard. **Admins** handle users and overview stats. Pick the role on the home page before logging in.'
  }

  if (/hello|hi|hey|good/.test(t)) {
    return role
      ? `Hi! You are on BookBase as a **${role}**. What would you like help with—borrowing, search, or your dashboard?`
      : 'Hi! I am the BookBase assistant. Try asking how to borrow books or how to log in.'
  }

  if (/thank|thanks/.test(t)) {
    return 'You are welcome. Happy reading!'
  }

  if (/book|catalog|search/.test(t)) {
    return 'Browse **Recommended** and **Categories** on the home page. Signed-in students see filtered books under **My Library** and can use the navbar search.'
  }

  return 'I am focused on BookBase basics: borrowing, login, departments, and navigation. Try rephrasing, or use the quick prompts below.'
}
