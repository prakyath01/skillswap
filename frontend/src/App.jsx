import { useEffect, useState } from "react";
import axios from "axios";

import {
  Home,
  Search,
  Bot,
  LogIn,
  UserPlus,
  ArrowRight,
  CalendarDays,
  Star,
  Users,
  LogOut,
  LayoutDashboard,
  XCircle,
  Clock,
  User,
  Send,
  BookOpen,
  ShieldCheck,
} from "lucide-react";

import "./App.css";

function App() {
  // =========================================================
  // API
  // =========================================================

  const API_URL =
    import.meta.env.VITE_API_URL || "https://refactored-dollop-9654qwxgw6v9cx9p9-8000.app.github.dev";

  const getToken = () =>
    localStorage.getItem("skillswap_token");

  const authHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
  });

  // =========================================================
  // AUTH STATE
  // =========================================================

  const [loggedIn, setLoggedIn] = useState(
    () => !!localStorage.getItem("skillswap_token")
  );

  const [currentUser, setCurrentUser] = useState(null);

  // =========================================================
  // LOGIN
  // =========================================================

  const [showLogin, setShowLogin] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [loginMessage, setLoginMessage] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // =========================================================
  // SIGNUP
  // =========================================================

  const [showSignup, setShowSignup] = useState(false);

  const [name, setName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [role, setRole] = useState("student");

  const [signupMessage, setSignupMessage] = useState("");
  const [signupError, setSignupError] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);

  // =========================================================
  // SKILLS
  // =========================================================

  const [skills, setSkills] = useState([]);
const [skillSearch, setSkillSearch] = useState("");

const [skillsLoading, setSkillsLoading] = useState(false);
const [skillsError, setSkillsError] = useState("");

const [newSkillTitle, setNewSkillTitle] = useState("");
const [newSkillDescription, setNewSkillDescription] = useState("");
const [newSkillCategory, setNewSkillCategory] = useState("");

const [skillMessage, setSkillMessage] = useState("");
const [skillCreateError, setSkillCreateError] = useState("");
const [skillCreateLoading, setSkillCreateLoading] = useState(false);


// =========================================================
// CREATE SKILL - MENTOR
// =========================================================

const handleCreateSkill = async (event) => {
  event.preventDefault();

  setSkillMessage("");
  setSkillCreateError("");

  if (!newSkillTitle.trim()) {
    setSkillCreateError("Please enter a skill title.");
    return;
  }

  setSkillCreateLoading(true);

  try {
    const response = await axios.post(
      `${API_URL}/skills`,
      {
        title: newSkillTitle.trim(),
        description: newSkillDescription.trim() || null,
        category: newSkillCategory.trim() || null,
      },
      {
        headers: authHeaders(),
      }
    );

    setSkills((previous) => [
      ...previous,
      response.data,
    ]);

    setNewSkillTitle("");
    setNewSkillDescription("");
    setNewSkillCategory("");

    setSkillMessage(
      "Skill added successfully!"
    );
  } catch (error) {
    setSkillCreateError(
      error.response?.data?.detail ||
        "Unable to add skill."
    );
  } finally {
    setSkillCreateLoading(false);
  }
};
  // =========================================================
  // BOOKING
  // =========================================================

  const [selectedSkill, setSelectedSkill] = useState(null);
  const [scheduledAt, setScheduledAt] = useState("");

  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingError, setBookingError] = useState("");

  // =========================================================
  // REVIEWS
  // =========================================================

  const [reviewBookingId, setReviewBookingId] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  const [reviewedBookings, setReviewedBookings] = useState([]);

  // =========================================================
  // MENTORS
  // =========================================================

  const [mentorSearch, setMentorSearch] = useState("");
  const [selectedMentor, setSelectedMentor] = useState(null);

  // =========================================================
  // AI
  // =========================================================

  const [aiMessage, setAiMessage] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const [aiMessages, setAiMessages] = useState([
    {
      sender: "ai",
      text:
        "Hi! I'm SkillSwap AI. Ask me about skills, learning paths, mentoring, or SkillSwap.",
    },
  ]);

  // =========================================================
  // PROFILE
  // =========================================================

  const [profileMessage, setProfileMessage] = useState("");

  // =========================================================
  // SCROLL
  // =========================================================

  const scrollTo = (id) => {
    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  // =========================================================
  // LOAD CURRENT USER
  // =========================================================

  const loadCurrentUser = async () => {
    const token = getToken();

    if (!token) {
      setLoggedIn(false);
      setCurrentUser(null);
      return;
    }

    try {
      const response = await axios.get(
        `${API_URL}/me`,
        {
          headers: authHeaders(),
        }
      );

      setCurrentUser(response.data);
      setLoggedIn(true);
    } catch (error) {
      localStorage.removeItem("skillswap_token");
      setCurrentUser(null);
      setLoggedIn(false);
    }
  };

  // =========================================================
  // LOAD SKILLS
  // =========================================================

  const loadSkills = async (searchText = "") => {
    setSkillsLoading(true);
    setSkillsError("");

    try {
      const response = await axios.get(
        `${API_URL}/skills`,
        {
          params: searchText
            ? { search: searchText }
            : {},
        }
      );

      setSkills(response.data);
    } catch (error) {
      setSkillsError(
        "Unable to load skills. Please make sure the backend is running."
      );
    } finally {
      setSkillsLoading(false);
    }
  };

  // =========================================================
  // LOAD BOOKINGS
  // =========================================================

  const loadBookings = async () => {
    if (!getToken()) {
      setBookings([]);
      return;
    }

    setBookingsLoading(true);
    setBookingError("");

    try {
      const response = await axios.get(
        `${API_URL}/bookings`,
        {
          headers: authHeaders(),
        }
      );

      setBookings(response.data);
    } catch (error) {
      setBookingError(
        error.response?.data?.detail ||
          "Unable to load your bookings."
      );
    } finally {
      setBookingsLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadCurrentUser();
    loadSkills();
  }, []);

  useEffect(() => {
    if (loggedIn) {
      loadBookings();
    }
  }, [loggedIn]);

  // =========================================================
  // OPEN LOGIN
  // =========================================================

  const openLogin = () => {
    setShowLogin(true);
    setShowSignup(false);

    setLoginMessage("");
    setLoginError("");

    setTimeout(() => {
      scrollTo("login");
    }, 100);
  };

  // =========================================================
  // OPEN SIGNUP
  // =========================================================

  const openSignup = () => {
    setShowSignup(true);
    setShowLogin(false);

    setSignupMessage("");
    setSignupError("");

    setTimeout(() => {
      scrollTo("signup");
    }, 100);
  };

  // =========================================================
  // LOGIN
  // =========================================================

  const handleLogin = async (event) => {
    event.preventDefault();

    setLoginMessage("");
    setLoginError("");
    setLoginLoading(true);

    try {
      const formData = new URLSearchParams();

      formData.append("username", loginEmail);
      formData.append("password", loginPassword);

      const response = await axios.post(
        `${API_URL}/login`,
        formData,
        {
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },
        }
      );

      const token = response.data.access_token;

      localStorage.setItem(
        "skillswap_token",
        token
      );

      const meResponse = await axios.get(
        `${API_URL}/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCurrentUser(meResponse.data);
      setLoggedIn(true);

      setLoginMessage("Login successful!");

      setLoginEmail("");
      setLoginPassword("");

      await loadBookings();

      setTimeout(() => {
        scrollTo("dashboard");
      }, 300);
    } catch (error) {
      setLoginError(
        error.response?.data?.detail ||
          "Invalid email or password."
      );
    } finally {
      setLoginLoading(false);
    }
  };

  // =========================================================
  // SIGNUP
  // =========================================================

  const handleSignup = async (event) => {
    event.preventDefault();

    setSignupMessage("");
    setSignupError("");
    setSignupLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/register`,
        {
          name,
          email: signupEmail,
          password: signupPassword,
          role,
        }
      );

      if (response.status === 201) {
        setSignupMessage(
          "Account created successfully!"
        );

        setName("");
        setSignupEmail("");
        setSignupPassword("");
        setRole("student");
      }
    } catch (error) {
      setSignupError(
        error.response?.data?.detail ||
          "Unable to create account."
      );
    } finally {
      setSignupLoading(false);
    }
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    localStorage.removeItem(
      "skillswap_token"
    );

    setLoggedIn(false);
    setCurrentUser(null);
    setBookings([]);
    setSelectedSkill(null);
    setSelectedMentor(null);

    scrollTo("home");
  };

  // =========================================================
  // SEARCH
  // =========================================================

  const handleSkillSearch = async (event) => {
    event.preventDefault();

    await loadSkills(skillSearch);
  };

  // =========================================================
  // BOOKING
  // =========================================================

  const openBooking = (skill) => {
    if (!loggedIn) {
      openLogin();
      return;
    }

    if (currentUser?.role !== "student") {
      setBookingError(
        "Only students can book mentoring sessions."
      );
      scrollTo("sessions");
      return;
    }

    setSelectedSkill(skill);
    setScheduledAt("");
    setBookingMessage("");
    setBookingError("");

    setTimeout(() => {
      scrollTo("booking");
    }, 100);
  };

  const handleBooking = async (event) => {
    event.preventDefault();

    if (!selectedSkill) {
      setBookingError(
        "Please select a skill."
      );
      return;
    }

    if (!scheduledAt) {
      setBookingError(
        "Please select a date and time."
      );
      return;
    }

    try {
      setBookingMessage("");
      setBookingError("");

      const response = await axios.post(
        `${API_URL}/bookings`,
        {
          skill_id: selectedSkill.id,
          mentor_id: selectedSkill.mentor_id,
          scheduled_at: scheduledAt,
        },
        {
          headers: authHeaders(),
        }
      );

      if (response.status === 201) {
        setBookingMessage(
          "Mentoring session booked successfully!"
        );

        setSelectedSkill(null);
        setScheduledAt("");

        await loadBookings();

        setTimeout(() => {
          scrollTo("sessions");
        }, 500);
      }
    } catch (error) {
      setBookingError(
        error.response?.data?.detail ||
          "Unable to book session."
      );
    }
  };

  // =========================================================
  // CANCEL BOOKING
  // =========================================================

  const handleCancelBooking = async (
    bookingId
  ) => {
    try {
      setBookingMessage("");
      setBookingError("");

      await axios.put(
        `${API_URL}/bookings/${bookingId}/cancel`,
        {},
        {
          headers: authHeaders(),
        }
      );

      setBookingMessage(
        "Booking cancelled successfully."
      );

      await loadBookings();
    } catch (error) {
      setBookingError(
        error.response?.data?.detail ||
          "Unable to cancel booking."
      );
    }
  };

  // =========================================================
  // REVIEW
  // =========================================================

  const openReview = (bookingId) => {
    setReviewBookingId(bookingId);
    setReviewRating(5);
    setReviewComment("");
    setReviewMessage("");
    setReviewError("");
  };

  const handleReview = async (event) => {
    event.preventDefault();

    if (!reviewBookingId) {
      return;
    }

    setReviewLoading(true);
    setReviewMessage("");
    setReviewError("");

    try {
      const response = await axios.post(
        `${API_URL}/reviews`,
        {
          booking_id: reviewBookingId,
          rating: Number(reviewRating),
          comment:
            reviewComment.trim() || null,
        },
        {
          headers: authHeaders(),
        }
      );

      if (response.status === 201) {
        setReviewMessage(
          "Review submitted successfully!"
        );

        setReviewedBookings((previous) => [
          ...previous,
          reviewBookingId,
        ]);

        setReviewBookingId(null);
        setReviewComment("");
      }
    } catch (error) {
      setReviewError(
        error.response?.data?.detail ||
          "Unable to submit review."
      );
    } finally {
      setReviewLoading(false);
    }
  };

  // =========================================================
  // MENTORS
  // =========================================================

  const mentors = skills.reduce(
    (list, skill) => {
      const existing = list.find(
        (mentor) =>
          mentor.id === skill.mentor_id
      );

      if (existing) {
        existing.skills.push(skill);
      } else {
        list.push({
          id: skill.mentor_id,
          skills: [skill],
        });
      }

      return list;
    },
    []
  );

  const filteredMentors =
    mentors.filter((mentor) => {
      if (!mentorSearch.trim()) {
        return true;
      }

      return mentor.skills.some((skill) =>
        skill.title
          .toLowerCase()
          .includes(
            mentorSearch.toLowerCase()
          )
      );
    });

  const openMentor = (mentor) => {
    setSelectedMentor(mentor);

    setTimeout(() => {
      scrollTo("mentor-details");
    }, 100);
  };

  // =========================================================
  // AI
  // =========================================================

  const handleAIMessage = async (event) => {
    event.preventDefault();

    if (!aiMessage.trim()) {
      return;
    }

    const message = aiMessage.trim();

    setAiMessage("");

    setAiMessages((previous) => [
      ...previous,
      {
        sender: "user",
        text: message,
      },
    ]);

    setAiLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/ai/chat`,
        {
          message,
        },
        {
          headers: getToken()
            ? authHeaders()
            : {},
        }
      );

      setAiMessages((previous) => [
        ...previous,
        {
          sender: "ai",
          text:
            response.data.response ||
            response.data.message ||
            "I received your message.",
        },
      ]);
    } catch (error) {
      setAiMessages((previous) => [
        ...previous,
        {
          sender: "ai",
          text:
            "SkillSwap AI is not connected to the backend yet.",
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  // =========================================================
  // PROFILE
  // =========================================================

  const refreshProfile = async () => {
    await loadCurrentUser();

    setProfileMessage(
      "Profile information refreshed."
    );
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="app">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="navbar">

        <div className="logo">

          <div className="logo-line logo-line-one">
            <div className="element-box">
              <span className="atomic-number">
                21
              </span>

              <span className="element-symbol">
                Sk
              </span>
            </div>

            <span className="logo-text">
              ill
            </span>
          </div>

          <div className="logo-line logo-line-two">
            <div className="element-box">
              <span className="atomic-number">
                74
              </span>

              <span className="element-symbol">
                Sw
              </span>
            </div>

            <span className="logo-text">
              ap
            </span>
          </div>

        </div>

        <nav className="nav-container">

          <a
            href="#home"
            className="nav-item active"
          >
            <Home size={20} />
            <span>Home</span>
          </a>

          <a
            href="#skills"
            className="nav-item"
          >
            <Search size={21} />
            <span>Skills</span>
          </a>

          <a
            href="#ai"
            className="nav-item"
          >
            <Bot size={21} />
            <span>AI Assistant</span>
          </a>

          {loggedIn ? (
            <button
              type="button"
              className="nav-item login-nav-button"
              onClick={() =>
                scrollTo("dashboard")
              }
            >
              <LayoutDashboard size={21} />
              <span>Dashboard</span>
            </button>
          ) : (
            <button
              type="button"
              className="nav-item login-nav-button"
              onClick={openLogin}
            >
              <LogIn size={21} />
              <span>Login</span>
            </button>
          )}

          {loggedIn ? (
            <button
              type="button"
              className="signup-button"
              onClick={handleLogout}
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          ) : (
            <button
              type="button"
              className="signup-button"
              onClick={openSignup}
            >
              <UserPlus size={20} />
              <span>Sign Up</span>
            </button>
          )}

        </nav>
      </header>

      <main>

        {/* ===================================================
            HERO
        =================================================== */}

        <section
          className="hero"
          id="home"
        >

          <div className="smoke-background">
            <div className="smoke smoke-left-one"></div>
            <div className="smoke smoke-left-two"></div>
            <div className="smoke smoke-left-three"></div>

            <div className="smoke smoke-right-one"></div>
            <div className="smoke smoke-right-two"></div>
            <div className="smoke smoke-right-three"></div>

            <div className="smoke smoke-top-one"></div>
            <div className="smoke smoke-bottom-one"></div>
          </div>

          <div className="hero-content">

            <div className="hero-badge">
              Student Skill Sharing Platform
            </div>

            <h1>
              Learn.
              <br />
              Share.
              <br />
              <span>Grow Together.</span>
            </h1>

            <p className="hero-description">
              SkillSwap connects students and
              mentors to share knowledge,
              discover skills
              <br className="desktop-break" />
              and book personalized mentoring
              sessions.
            </p>

            <div className="hero-buttons">

              <a
                href="#skills"
                className="primary-button"
              >
                <span>
                  Explore Skills
                </span>

                <ArrowRight size={22} />
              </a>

              <button
                type="button"
                className="secondary-button"
                onClick={openSignup}
              >
                <span>
                  Join SkillSwap
                </span>

                <UserPlus size={20} />
              </button>

            </div>

          </div>
        </section>

        {/* ===================================================
            DASHBOARD
        =================================================== */}

        {loggedIn && (
          <section
            className="skills-section"
            id="dashboard"
          >

            <div className="section-heading">

              <p>
                SKILLSWAP DASHBOARD
              </p>

              <h2>
                Welcome,
                <span>
                  {" "}
                  {currentUser?.name ||
                    "Student"}
                </span>
              </h2>

              <div className="heading-line"></div>

            </div>

            <div className="skill-cards">

              <DashboardCard
                number="01"
                icon={<Search size={30} />}
                title="Explore Skills"
                description="Search for skills shared by mentors and students."
                onClick={() =>
                  scrollTo("skills")
                }
                link="Explore"
              />

              <DashboardCard
                number="02"
                icon={
                  <CalendarDays size={30} />
                }
                title="My Sessions"
                description="View and manage your mentoring sessions."
                onClick={() =>
                  scrollTo("sessions")
                }
                link="View Sessions"
              />

              <DashboardCard
                number="03"
                icon={<Star size={30} />}
                title="Reviews"
                description="Rate and review your mentoring sessions."
                onClick={() =>
                  scrollTo("sessions")
                }
                link="My Reviews"
              />

              <DashboardCard
                number="04"
                icon={<Users size={30} />}
                title="Find Mentors"
                description="Discover mentors and see the skills they teach."
                onClick={() =>
                  scrollTo("mentors")
                }
                link="Find Mentors"
              />

              <DashboardCard
                number="05"
                icon={<Bot size={30} />}
                title="SkillSwap AI"
                description="Get learning guidance from the AI assistant."
                onClick={() =>
                  scrollTo("ai")
                }
                link="Talk to AI"
              />

              <DashboardCard
                number="06"
                icon={<User size={30} />}
                title="My Profile"
                description="View your account and profile information."
                onClick={() =>
                  scrollTo("profile")
                }
                link="View Profile"
              />

            </div>
          </section>
        )}

        {/* ===================================================
            MENTOR - MY SKILLS
        =================================================== */}

        {loggedIn && currentUser?.role === "mentor" && (
          <section
            className="signup-section"
            id="my-skills"
          >
            <div className="signup-content">
              <span>MENTOR DASHBOARD</span>

              <h2>
                Add Your
                <strong>{" "}Skills.</strong>
              </h2>

              <p>
                Add skills you can teach so students can discover
                you and book mentoring sessions.
              </p>

              <form
                className="signup-form"
                onSubmit={handleCreateSkill}
              >
                <div className="form-group">
                  <label>Skill Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Python Programming"
                    value={newSkillTitle}
                    onChange={(event) =>
                      setNewSkillTitle(event.target.value)
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    placeholder="Describe what you can teach..."
                    value={newSkillDescription}
                    onChange={(event) =>
                      setNewSkillDescription(event.target.value)
                    }
                    rows="4"
                    style={{
                      width: "100%",
                      padding: "14px",
                      background: "#07140a",
                      color: "#ffffff",
                      border: "1px solid rgba(65,255,128,0.25)",
                      borderRadius: "10px",
                      resize: "vertical",
                      outline: "none",
                      fontFamily: "inherit",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Programming, AI, Design"
                    value={newSkillCategory}
                    onChange={(event) =>
                      setNewSkillCategory(event.target.value)
                    }
                  />
                </div>

                <button
                  type="submit"
                  className="primary-button signup-submit"
                  disabled={skillCreateLoading}
                >
                  {skillCreateLoading ? (
                    "Adding Skill..."
                  ) : (
                    <>
                      Add Skill
                      <BookOpen size={20} />
                    </>
                  )}
                </button>

                {skillMessage && (
                  <div className="success-message">
                    ✓ {skillMessage}
                  </div>
                )}

                {skillCreateError && (
                  <div className="error-message">
                    {skillCreateError}
                  </div>
                )}
              </form>

              {skills.filter(
                (skill) => skill.mentor_id === currentUser.id
              ).length > 0 && (
                <div
                  style={{
                    marginTop: "35px",
                    textAlign: "left",
                  }}
                >
                  <h3 style={{ marginBottom: "18px" }}>
                    Your Skills
                  </h3>

                  {skills
                    .filter(
                      (skill) => skill.mentor_id === currentUser.id
                    )
                    .map((skill) => (
                      <div
                        key={skill.id}
                        style={{
                          padding: "16px",
                          marginBottom: "12px",
                          border: "1px solid rgba(66,255,131,0.18)",
                          borderRadius: "10px",
                          background: "rgba(66,255,131,0.04)",
                        }}
                      >
                        <strong style={{ color: "#42ff83" }}>
                          {skill.title}
                        </strong>
                        <p style={{ margin: "8px 0" }}>
                          {skill.description ||
                            "Skill available for mentoring."}
                        </p>
                        {skill.category && (
                          <span
                            style={{
                              color: "#42ff83",
                              fontSize: "12px",
                            }}
                          >
                            {skill.category}
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ===================================================
            SKILLS
        =================================================== */}

        <section
          className="skills-section"
          id="skills"
        >

          <div className="section-heading">

            <p>
              EXPLORE SKILLS
            </p>

            <h2>
              Learn From
              <span>
                {" "}Each Other
              </span>
            </h2>

            <div className="heading-line"></div>

          </div>

          <form
            onSubmit={handleSkillSearch}
            style={{
              maxWidth: "700px",
              margin: "0 auto 45px",
              display: "flex",
              gap: "10px",
            }}
          >

            <input
              type="text"
              placeholder="Search for a skill..."
              value={skillSearch}
              onChange={(event) =>
                setSkillSearch(
                  event.target.value
                )
              }
              style={inputStyle}
            />

            <button
              type="submit"
              className="primary-button"
              style={{
                minWidth: "130px",
                height: "52px",
              }}
            >
              <Search size={18} />
              Search
            </button>

          </form>

          {skillsLoading && (
            <StatusMessage>
              Loading skills...
            </StatusMessage>
          )}

          {skillsError && (
            <div
              className="error-message"
              style={{
                maxWidth: "600px",
                margin: "0 auto 30px",
              }}
            >
              {skillsError}
            </div>
          )}

          {!skillsLoading &&
            !skillsError &&
            skills.length > 0 && (

              <div className="skill-cards">

                {skills.map((skill) => (
                  <div
                    className="skill-card"
                    key={skill.id}
                  >

                    <div className="card-number">
                      {String(skill.id).padStart(
                        2,
                        "0"
                      )}
                    </div>

                    <BookOpen
                      size={28}
                      color="#42ff83"
                      style={{
                        marginBottom:
                          "18px",
                      }}
                    />

                    <h3>
                      {skill.title}
                    </h3>

                    <p>
                      {skill.description ||
                        "Learn this skill from a SkillSwap mentor."}
                    </p>

                    {skill.category && (
                      <div
                        style={{
                          color: "#42ff83",
                          fontSize: "12px",
                          fontWeight: "700",
                          marginBottom: "15px",
                        }}
                      >
                        {skill.category}
                      </div>
                    )}

                    <div
                      style={{
                        color: "#68746b",
                        fontSize: "12px",
                        marginBottom: "18px",
                      }}
                    >
                      Mentor ID:{" "}
                      {skill.mentor_id}
                    </div>

                    <button
                      type="button"
                      className="primary-button"
                      onClick={() =>
                        openBooking(skill)
                      }
                      style={{
                        width: "100%",
                        justifyContent:
                          "center",
                        marginBottom:
                          "10px",
                      }}
                    >
                      <CalendarDays
                        size={17}
                      />
                      Book Session
                    </button>

                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => {
                        const mentor =
                          mentors.find(
                            (item) =>
                              item.id ===
                              skill.mentor_id
                          );

                        if (mentor) {
                          openMentor(
                            mentor
                          );
                        }
                      }}
                      style={{
                        width: "100%",
                        justifyContent:
                          "center",
                      }}
                    >
                      <Users size={17} />
                      View Mentor
                    </button>

                  </div>
                ))}

              </div>
            )}

          {!skillsLoading &&
            !skillsError &&
            skills.length === 0 && (
              <StatusMessage>
                No skills found.
              </StatusMessage>
            )}

        </section>

        {/* ===================================================
            BOOKING
        =================================================== */}

        {loggedIn &&
          currentUser?.role === "student" &&
          selectedSkill && (

            <section
              className="signup-section"
              id="booking"
            >

              <div className="signup-content">

                <span>
                  BOOK A SESSION
                </span>

                <h2>
                  Learn
                  <strong>
                    {" "}
                    {selectedSkill.title}.
                  </strong>
                </h2>

                <p>
                  Choose a date and time
                  for your mentoring
                  session with Mentor ID{" "}
                  {selectedSkill.mentor_id}.
                </p>

                <form
                  className="signup-form"
                  onSubmit={handleBooking}
                >

                  <div className="form-group">

                    <label>
                      Session Date & Time
                    </label>

                    <input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(event) =>
                        setScheduledAt(
                          event.target.value
                        )
                      }
                      required
                    />

                  </div>

                  <button
                    type="submit"
                    className="primary-button signup-submit"
                  >
                    Confirm Booking
                    <CalendarDays
                      size={20}
                    />
                  </button>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      setSelectedSkill(null);
                      setScheduledAt("");
                    }}
                  >
                    Cancel
                  </button>

                  {bookingMessage && (
                    <div className="success-message">
                      ✓ {bookingMessage}
                    </div>
                  )}

                  {bookingError && (
                    <div className="error-message">
                      {bookingError}
                    </div>
                  )}

                </form>

              </div>

            </section>
          )}

        {/* ===================================================
            MY SESSIONS
        =================================================== */}

        {loggedIn && (
          <section
            className="skills-section"
            id="sessions"
          >

            <div className="section-heading">

              <p>
                YOUR BOOKINGS
              </p>

              <h2>
                My
                <span>
                  {" "}Sessions
                </span>
              </h2>

              <div className="heading-line"></div>

            </div>

            {bookingMessage && (
              <div
                className="success-message"
                style={{
                  maxWidth: "700px",
                  margin: "0 auto 30px",
                }}
              >
                ✓ {bookingMessage}
              </div>
            )}

            {bookingError && (
              <div
                className="error-message"
                style={{
                  maxWidth: "700px",
                  margin: "0 auto 30px",
                }}
              >
                {bookingError}
              </div>
            )}

            {reviewMessage && (
              <div
                className="success-message"
                style={{
                  maxWidth: "700px",
                  margin: "0 auto 30px",
                }}
              >
                ✓ {reviewMessage}
              </div>
            )}

            {bookingsLoading && (
              <StatusMessage>
                Loading your sessions...
              </StatusMessage>
            )}

            {!bookingsLoading &&
              bookings.length === 0 && (
                <StatusMessage>
                  <CalendarDays
                    size={40}
                    color="#42ff83"
                  />

                  <h3>
                    No sessions yet
                  </h3>

                  <p>
                    Book a mentoring
                    session from the
                    Skills section.
                  </p>
                </StatusMessage>
              )}

            {!bookingsLoading &&
              bookings.length > 0 && (

                <div className="skill-cards">

                  {bookings.map((booking) => (
                    <div
                      className="skill-card"
                      key={booking.id}
                    >

                      <div className="card-number">
                        {String(
                          booking.id
                        ).padStart(
                          2,
                          "0"
                        )}
                      </div>

                      <CalendarDays
                        size={30}
                        color="#42ff83"
                        style={{
                          marginBottom:
                            "20px",
                        }}
                      />

                      <h3>
                        Session #
                        {booking.id}
                      </h3>

                      <p>
                        Skill ID:{" "}
                        {booking.skill_id}
                      </p>

                      <p>
                        Mentor ID:{" "}
                        {booking.mentor_id}
                      </p>

                      <div
                        style={{
                          display: "flex",
                          alignItems:
                            "center",
                          gap: "8px",
                          color:
                            "#42ff83",
                          fontSize:
                            "13px",
                          marginBottom:
                            "15px",
                        }}
                      >
                        <Clock size={16} />

                        {new Date(
                          booking.scheduled_at
                        ).toLocaleString()}
                      </div>

                      <div
                        style={{
                          display:
                            "inline-block",
                          padding:
                            "6px 12px",
                          borderRadius:
                            "20px",
                          background:
                            "rgba(66,255,131,0.10)",
                          border:
                            "1px solid rgba(66,255,131,0.25)",
                          color:
                            booking.status ===
                            "cancelled"
                              ? "#ff6b6b"
                              : "#42ff83",
                          fontSize:
                            "12px",
                          fontWeight:
                            "700",
                          textTransform:
                            "uppercase",
                          marginBottom:
                            "18px",
                        }}
                      >
                        {booking.status}
                      </div>

                      {booking.status !==
                        "cancelled" && (
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() =>
                            handleCancelBooking(
                              booking.id
                            )
                          }
                          style={{
                            width: "100%",
                            justifyContent:
                              "center",
                          }}
                        >
                          <XCircle
                            size={17}
                          />
                          Cancel Session
                        </button>
                      )}

                      {booking.status !==
                        "cancelled" &&
                        !reviewedBookings.includes(
                          booking.id
                        ) && (
                          <button
                            type="button"
                            className="primary-button"
                            onClick={() =>
                              openReview(
                                booking.id
                              )
                            }
                            style={{
                              width: "100%",
                              justifyContent:
                                "center",
                              marginTop:
                                "10px",
                            }}
                          >
                            <Star size={17} />
                            Rate Session
                          </button>
                        )}

                      {reviewedBookings.includes(
                        booking.id
                      ) && (
                        <div
                          style={{
                            color:
                              "#42ff83",
                            fontSize:
                              "13px",
                            marginTop:
                              "15px",
                            fontWeight:
                              "700",
                          }}
                        >
                          ✓ Review submitted
                        </div>
                      )}

                      {reviewBookingId ===
                        booking.id && (
                        <form
                          onSubmit={
                            handleReview
                          }
                          style={{
                            marginTop:
                              "20px",
                            paddingTop:
                              "20px",
                            borderTop:
                              "1px solid rgba(66,255,131,0.15)",
                          }}
                        >

                          <div className="form-group">

                            <label>
                              Rating
                            </label>

                            <select
                              value={
                                reviewRating
                              }
                              onChange={(
                                event
                              ) =>
                                setReviewRating(
                                  event.target
                                    .value
                                )
                              }
                            >
                              <option value="5">
                                ★★★★★ — 5
                              </option>

                              <option value="4">
                                ★★★★☆ — 4
                              </option>

                              <option value="3">
                                ★★★☆☆ — 3
                              </option>

                              <option value="2">
                                ★★☆☆☆ — 2
                              </option>

                              <option value="1">
                                ★☆☆☆☆ — 1
                              </option>
                            </select>

                          </div>

                          <div className="form-group">

                            <label>
                              Comment
                            </label>

                            <textarea
                              placeholder="Share your experience..."
                              value={
                                reviewComment
                              }
                              onChange={(
                                event
                              ) =>
                                setReviewComment(
                                  event.target
                                    .value
                                )
                              }
                              rows="4"
                              style={{
                                width:
                                  "100%",
                                padding:
                                  "14px",
                                background:
                                  "#07140a",
                                color:
                                  "#ffffff",
                                border:
                                  "1px solid rgba(65,255,128,0.25)",
                                borderRadius:
                                  "10px",
                                resize:
                                  "vertical",
                                outline:
                                  "none",
                                fontFamily:
                                  "inherit",
                              }}
                            />

                          </div>

                          <button
                            type="submit"
                            className="primary-button"
                            disabled={
                              reviewLoading
                            }
                            style={{
                              width:
                                "100%",
                              justifyContent:
                                "center",
                            }}
                          >
                            {reviewLoading ? (
                              "Submitting..."
                            ) : (
                              <>
                                Submit Review
                                <Star
                                  size={17}
                                />
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                              setReviewBookingId(
                                null
                              )
                            }
                            style={{
                              width:
                                "100%",
                              justifyContent:
                                "center",
                              marginTop:
                                "10px",
                            }}
                          >
                            Close
                          </button>

                          {reviewError && (
                            <div
                              className="error-message"
                              style={{
                                marginTop:
                                  "12px",
                              }}
                            >
                              {reviewError}
                            </div>
                          )}

                        </form>
                      )}

                    </div>
                  ))}

                </div>
              )}

          </section>
        )}

        {/* ===================================================
            FIND MENTORS
        =================================================== */}

        <section
          className="skills-section"
          id="mentors"
        >

          <div className="section-heading">

            <p>
              CONNECT
            </p>

            <h2>
              Find
              <span>
                {" "}Mentors
              </span>
            </h2>

            <div className="heading-line"></div>

          </div>

          <div
            style={{
              maxWidth: "700px",
              margin: "0 auto 40px",
            }}
          >
            <input
              type="text"
              placeholder="Search mentors by skill..."
              value={mentorSearch}
              onChange={(event) =>
                setMentorSearch(
                  event.target.value
                )
              }
              style={inputStyle}
            />
          </div>

          {filteredMentors.length === 0 ? (
            <StatusMessage>
              No mentors found.
            </StatusMessage>
          ) : (
            <div className="skill-cards">

              {filteredMentors.map(
                (mentor) => (
                  <div
                    className="skill-card"
                    key={mentor.id}
                  >

                    <div className="card-number">
                      {String(
                        mentor.id
                      ).padStart(
                        2,
                        "0"
                      )}
                    </div>

                    <Users
                      size={32}
                      color="#42ff83"
                      style={{
                        marginBottom:
                          "18px",
                      }}
                    />

                    <h3>
                      Mentor #
                      {mentor.id}
                    </h3>

                    <p>
                      Skills offered by
                      this mentor:
                    </p>

                    <div
                      style={{
                        marginBottom:
                          "20px",
                      }}
                    >

                      {mentor.skills.map(
                        (skill) => (
                          <span
                            key={skill.id}
                            style={{
                              display:
                                "inline-block",
                              padding:
                                "6px 10px",
                              margin:
                                "4px",
                              border:
                                "1px solid rgba(66,255,131,0.25)",
                              borderRadius:
                                "20px",
                              color:
                                "#42ff83",
                              fontSize:
                                "12px",
                            }}
                          >
                            {skill.title}
                          </span>
                        )
                      )}

                    </div>

                    <button
                      type="button"
                      className="primary-button"
                      onClick={() =>
                        openMentor(
                          mentor
                        )
                      }
                      style={{
                        width: "100%",
                        justifyContent:
                          "center",
                      }}
                    >
                      <User size={17} />
                      View Mentor
                    </button>

                  </div>
                )
              )}

            </div>
          )}

        </section>

        {/* ===================================================
            MENTOR DETAILS
        =================================================== */}

        {selectedMentor && (
          <section
            className="signup-section"
            id="mentor-details"
          >

            <div className="signup-content">

              <span>
                MENTOR PROFILE
              </span>

              <h2>
                Mentor
                <strong>
                  {" "}
                  #{selectedMentor.id}
                </strong>
              </h2>

              <p>
                Skills offered by this
                mentor:
              </p>

              <div
                style={{
                  margin: "25px 0",
                }}
              >

                {selectedMentor.skills.map(
                  (skill) => (
                    <div
                      key={skill.id}
                      style={{
                        padding: "18px",
                        marginBottom:
                          "12px",
                        border:
                          "1px solid rgba(66,255,131,0.18)",
                        borderRadius:
                          "10px",
                        background:
                          "rgba(66,255,131,0.04)",
                        textAlign: "left",
                      }}
                    >

                      <strong
                        style={{
                          color:
                            "#42ff83",
                        }}
                      >
                        {skill.title}
                      </strong>

                      <p>
                        {skill.description ||
                          "Skill available for mentoring."}
                      </p>

                      <button
                        type="button"
                        className="primary-button"
                        onClick={() =>
                          openBooking(
                            skill
                          )
                        }
                        style={{
                          marginTop:
                            "10px",
                        }}
                      >
                        <CalendarDays
                          size={17}
                        />
                        Book Session
                      </button>

                    </div>
                  )
                )}

              </div>

              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setSelectedMentor(null);
                  scrollTo("mentors");
                }}
              >
                Back to Mentors
              </button>

            </div>

          </section>
        )}

        {/* ===================================================
            PROFILE
        =================================================== */}

        {loggedIn && (
          <section
            className="skills-section"
            id="profile"
          >

            <div className="section-heading">

              <p>
                ACCOUNT
              </p>

              <h2>
                My
                <span>
                  {" "}Profile
                </span>
              </h2>

              <div className="heading-line"></div>

            </div>

            <div className="skill-cards">

              <div className="skill-card">

                <User
                  size={35}
                  color="#42ff83"
                  style={{
                    marginBottom:
                      "20px",
                  }}
                />

                <h3>
                  {currentUser?.name}
                </h3>

                <p>
                  Email
                </p>

                <strong>
                  {currentUser?.email}
                </strong>

              </div>

              <div className="skill-card">

                <ShieldCheck
                  size={35}
                  color="#42ff83"
                  style={{
                    marginBottom:
                      "20px",
                  }}
                />

                <h3>
                  Account Role
                </h3>

                <p>
                  Your SkillSwap
                  role:
                </p>

                <strong
                  style={{
                    color:
                      "#42ff83",
                    textTransform:
                      "uppercase",
                  }}
                >
                  {currentUser?.role}
                </strong>

              </div>

              <div className="skill-card">

                <LayoutDashboard
                  size={35}
                  color="#42ff83"
                  style={{
                    marginBottom:
                      "20px",
                  }}
                />

                <h3>
                  Account Security
                </h3>

                <p>
                  Your account uses
                  JWT authentication
                  for protected API
                  access.
                </p>

              </div>

            </div>

            <div
              style={{
                textAlign: "center",
                marginTop: "30px",
              }}
            >

              <button
                type="button"
                className="primary-button"
                onClick={
                  refreshProfile
                }
              >
                <User size={18} />
                Refresh Profile
              </button>

              {profileMessage && (
                <div
                  className="success-message"
                  style={{
                    maxWidth:
                      "500px",
                    margin:
                      "20px auto",
                  }}
                >
                  ✓ {profileMessage}
                </div>
              )}

            </div>

          </section>
        )}

        {/* ===================================================
            SKILLSWAP AI
        =================================================== */}

        <section
          className="ai-section"
          id="ai"
        >

          <div
            className="ai-box"
            style={{
              display: "block",
            }}
          >

            <div
              className="ai-icon"
              style={{
                marginBottom:
                  "15px",
              }}
            >
              <Bot size={30} />
            </div>

            <div className="ai-text">

              <span>
                SKILLSWAP AI
              </span>

              <h2>
                Your Personal
                <strong>
                  {" "}Learning Assistant
                </strong>
              </h2>

              <p>
                Ask questions about
                skills, learning and
                mentoring.
              </p>

            </div>

            <div
              style={{
                maxWidth: "800px",
                margin:
                  "30px auto 0",
              }}
            >

              <div
                style={{
                  maxHeight:
                    "350px",
                  overflowY:
                    "auto",
                  padding: "20px",
                  background:
                    "rgba(0,0,0,0.25)",
                  border:
                    "1px solid rgba(66,255,131,0.15)",
                  borderRadius:
                    "12px",
                  marginBottom:
                    "15px",
                }}
              >

                {aiMessages.map(
                  (message, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        justifyContent:
                          message.sender ===
                          "user"
                            ? "flex-end"
                            : "flex-start",
                        marginBottom:
                          "12px",
                      }}
                    >

                      <div
                        style={{
                          maxWidth:
                            "75%",
                          padding:
                            "12px 16px",
                          borderRadius:
                            "12px",
                          background:
                            message.sender ===
                            "user"
                              ? "rgba(66,255,131,0.15)"
                              : "rgba(255,255,255,0.05)",
                          border:
                            "1px solid rgba(66,255,131,0.15)",
                          color:
                            "#ffffff",
                          fontSize:
                            "14px",
                          lineHeight:
                            "1.5",
                        }}
                      >
                        {message.text}
                      </div>

                    </div>
                  )
                )}

                {aiLoading && (
                  <div
                    style={{
                      color:
                        "#42ff83",
                      fontSize:
                        "13px",
                    }}
                  >
                    SkillSwap AI is
                    thinking...
                  </div>
                )}

              </div>

              <form
                onSubmit={
                  handleAIMessage
                }
                style={{
                  display: "flex",
                  gap: "10px",
                }}
              >

                <input
                  type="text"
                  placeholder="Ask SkillSwap AI..."
                  value={aiMessage}
                  onChange={(event) =>
                    setAiMessage(
                      event.target.value
                    )
                  }
                  style={inputStyle}
                />

                <button
                  type="submit"
                  className="primary-button"
                  disabled={aiLoading}
                >
                  <Send size={18} />
                  Send
                </button>

              </form>

            </div>

          </div>

        </section>

        {/* ===================================================
            LOGIN
        =================================================== */}

        {!loggedIn && (
          <section
            className="signup-section"
            id="login"
          >

            {!showLogin ? (
              <div className="signup-content">

                <span>
                  WELCOME BACK
                </span>

                <h2>
                  Continue Your
                  <br />
                  <strong>
                    SkillSwap Journey.
                  </strong>
                </h2>

                <p>
                  Log in to discover
                  skills, connect with
                  mentors and manage
                  sessions.
                </p>

                <button
                  type="button"
                  className="primary-button"
                  onClick={openLogin}
                >
                  Login
                  <LogIn size={20} />
                </button>

              </div>
            ) : (
              <div className="signup-content">

                <span>
                  WELCOME BACK
                </span>

                <h2>
                  Login to
                  <strong>
                    {" "}SkillSwap.
                  </strong>
                </h2>

                <p>
                  Enter your account
                  details to continue.
                </p>

                <form
                  className="signup-form"
                  onSubmit={handleLogin}
                >

                  <div className="form-group">

                    <label>
                      Email
                    </label>

                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={loginEmail}
                      onChange={(event) =>
                        setLoginEmail(
                          event.target
                            .value
                        )
                      }
                      required
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      Password
                    </label>

                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(event) =>
                        setLoginPassword(
                          event.target
                            .value
                        )
                      }
                      required
                    />

                  </div>

                  <button
                    type="submit"
                    className="primary-button signup-submit"
                    disabled={
                      loginLoading
                    }
                  >
                    {loginLoading ? (
                      "Logging in..."
                    ) : (
                      <>
                        Login
                        <ArrowRight
                          size={20}
                        />
                      </>
                    )}
                  </button>

                  {loginMessage && (
                    <div className="success-message">
                      ✓ {loginMessage}
                    </div>
                  )}

                  {loginError && (
                    <div className="error-message">
                      {loginError}
                    </div>
                  )}

                </form>

              </div>
            )}

          </section>
        )}

        {/* ===================================================
            SIGNUP
        =================================================== */}

        {!loggedIn && (
          <section
            className="signup-section"
            id="signup"
          >

            {!showSignup ? (
              <div className="signup-content">

                <span>
                  JOIN SKILLSWAP
                </span>

                <h2>
                  Share what you know.
                  <br />
                  <strong>
                    Learn what you don't.
                  </strong>
                </h2>

                <p>
                  Join a community
                  where students teach,
                  learn and grow together.
                </p>

                <button
                  type="button"
                  className="primary-button"
                  onClick={openSignup}
                >
                  Get Started
                  <ArrowRight size={20} />
                </button>

              </div>
            ) : (
              <div className="signup-content">

                <span>
                  CREATE YOUR ACCOUNT
                </span>

                <h2>
                  Join
                  <strong>
                    {" "}SkillSwap.
                  </strong>
                </h2>

                <p>
                  Create your account
                  and start sharing and
                  learning skills.
                </p>

                <form
                  className="signup-form"
                  onSubmit={handleSignup}
                >

                  <div className="form-group">

                    <label>
                      Name
                    </label>

                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(event) =>
                        setName(
                          event.target
                            .value
                        )
                      }
                      required
                      minLength={2}
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      Email
                    </label>

                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={
                        signupEmail
                      }
                      onChange={(event) =>
                        setSignupEmail(
                          event.target
                            .value
                        )
                      }
                      required
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      Password
                    </label>

                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={
                        signupPassword
                      }
                      onChange={(event) =>
                        setSignupPassword(
                          event.target
                            .value
                        )
                      }
                      required
                      minLength={6}
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      I am a
                    </label>

                    <select
                      value={role}
                      onChange={(event) =>
                        setRole(
                          event.target
                            .value
                        )
                      }
                    >
                      <option value="student">
                        Student
                      </option>

                      <option value="mentor">
                        Mentor
                      </option>
                    </select>

                  </div>

                  <button
                    type="submit"
                    className="primary-button signup-submit"
                    disabled={
                      signupLoading
                    }
                  >
                    {signupLoading ? (
                      "Creating Account..."
                    ) : (
                      <>
                        Create Account
                        <ArrowRight
                          size={20}
                        />
                      </>
                    )}
                  </button>

                  {signupMessage && (
                    <div className="success-message">
                      ✓ {signupMessage}
                    </div>
                  )}

                  {signupError && (
                    <div className="error-message">
                      {signupError}
                    </div>
                  )}

                </form>

              </div>
            )}

          </section>
        )}

      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="footer">

        <div className="footer-logo">

          <div className="footer-logo-line">
            <div className="footer-element">
              Sk
            </div>

            <span>
              ill
            </span>
          </div>

          <div className="footer-logo-line">
            <div className="footer-element">
              Sw
            </div>

            <span>
              ap
            </span>
          </div>

        </div>

        <p>
          © 2026 SkillSwap.
          Learn. Share. Grow.
        </p>

      </footer>

    </div>
  );
}


// ===========================================================
// DASHBOARD CARD
// ===========================================================

function DashboardCard({
  number,
  icon,
  title,
  description,
  onClick,
  link,
}) {
  return (
    <div
      className="skill-card"
      onClick={onClick}
      style={{
        cursor: "pointer",
      }}
    >
      <div className="card-number">
        {number}
      </div>

      <div
        style={{
          color: "#42ff83",
          marginBottom: "20px",
        }}
      >
        {icon}
      </div>

      <h3>{title}</h3>

      <p>{description}</p>

      <button
        type="button"
        className="card-link-button"
        onClick={(event) => {
          event.stopPropagation();
          onClick();
        }}
      >
        {link}
        <ArrowRight size={16} />
      </button>
    </div>
  );
}


// ===========================================================
// STATUS MESSAGE
// ===========================================================

function StatusMessage({ children }) {
  return (
    <div
      style={{
        textAlign: "center",
        color: "#89948c",
        padding: "35px",
      }}
    >
      {children}
    </div>
  );
}


// ===========================================================
// INPUT STYLE
// ===========================================================

const inputStyle = {
  width: "100%",
  height: "52px",
  padding: "0 18px",
  color: "#ffffff",
  background: "#07140a",
  border:
    "1px solid rgba(65,255,128,0.25)",
  borderRadius: "10px",
  outline: "none",
  boxSizing: "border-box",
};


// ===========================================================
// EXPORT
// ===========================================================

export default App;
