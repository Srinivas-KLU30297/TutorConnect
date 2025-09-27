export const subjects = [
  "Mathematics","Physics","Chemistry","Biology",
  "English","Literature","Computer Science","Programming","Web Development"
];

export const tutors = [
  {
    id: "t1",
    name: "Dr. Michael Smith",
    location: "New York, NY",
    subjects: ["Mathematics","Physics"],
    hourlyRate: 65,
    rating: 4.8,
    totalReviews: 127,
    bio: "Experienced physics and mathematics tutor with 10+ years.",
    availability: ["Mon 9-5","Tue 10-4","Wed 9-6","Thu 11-7","Fri 9-4"],
    reviews: [
      { id: "r1", student: "Sarah J.", rating: 5, comment: "Great explanations!" }
    ]
  },
  {
    id: "t2",
    name: "Emily Chen",
    location: "New York, NY",
    subjects: ["English","Literature","Writing"],
    hourlyRate: 45,
    rating: 4.9,
    totalReviews: 89,
    bio: "English literature specialist focused on writing skills.",
    availability: ["Mon 2-8","Tue 9-3","Wed 1-7","Thu 10-6","Fri 9-5"]
  },
  {
    id: "t3",
    name: "Alex Rodriguez",
    location: "San Francisco, CA",
    subjects: ["Computer Science","Programming","Web Development"],
    hourlyRate: 75,
    rating: 4.7,
    totalReviews: 156,
    bio: "Full‑stack developer helping with coding projects and interviews.",
    availability: ["Mon 6-10","Tue 3-9","Wed 2-8","Thu 5-11","Fri 3-7"]
  }
];

export const demoUsers = {
  students: [
    { id: "s1", email: "sarah@example.com", password: "password123", name: "Sarah Johnson", role: "student" },
    { id: "s2", email: "john@example.com",  password: "password123", name: "John Davis",   role: "student" }
  ],
  tutors: [
    { id: "t1u", email: "mike@example.com",  password: "password123", name: "Dr. Michael Smith", role: "tutor" },
    { id: "t2u", email: "emily@example.com", password: "password123", name: "Emily Chen",        role: "tutor" },
    { id: "t3u", email: "alex@example.com",  password: "password123", name: "Alex Rodriguez",    role: "tutor" }
  ]
};

