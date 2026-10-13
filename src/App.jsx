
import { useEffect, useState } from "react";
import "./App.css";

const STORAGE_KEY = "portfolios";

const emptyForm = {
  name: "",
  title: "",
  profilePicture: "",
  email: "",
  contactNumber: "",
  address: "",
  about: "",
  education: "",
  skills: "",
  projects: "",
  experience: "",
  links: "",
  template: "simple",
  additionalInfo: [],
};

const templates = [
  { id: "simple", name: "Simple", description: "Clean and professional" },
  { id: "modern", name: "Modern", description: "Fresh and organized" },
  { id: "creative", name: "Creative", description: "Bold and expressive" },
];

function readPortfolios() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function PortfolioPreview({ item }) {
  const skills = (item.skills || "")
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

  const links = (item.links || "")
    .split("\n")
    .map((link) => link.trim())
    .filter(Boolean);

  function safeUrl(link) {
    return /^https?:\/\//i.test(link) ? link : `https://${link}`;
  }

  return (
    <article className={`portfolio-preview template-${item.template || "simple"}`}>
      <header className="portfolio-preview-header">
        {item.profilePicture ? (
          <img
            className="portfolio-profile-picture"
            src={item.profilePicture}
            alt={`${item.name || "User"}'s profile`}
          />
        ) : (
          <div className="portfolio-avatar">
            {(item.name || "Y").trim().charAt(0).toUpperCase()}
          </div>
        )}

        <div className="portfolio-heading-text">
          <p className="portfolio-kicker">MY PORTFOLIO</p>
          <h2>{item.name || "Your Full Name"}</h2>
          <p className="portfolio-job-title">
            {item.title || "Your Professional Title"}
          </p>
        </div>
      </header>

      {item.address && (
        <p className="portfolio-location">📍 {item.address}</p>
      )}

      <section className="portfolio-about">
        <h3>About Me</h3>
        <p>{item.about || "Your introduction will appear here."}</p>
      </section>

      {skills.length > 0 && (
        <section className="portfolio-skills">
          <h3>Skills</h3>
          <div className="skill-list">
            {skills.map((skill, index) => (
              <span className="skill-tag" key={`${skill}-${index}`}>
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {item.education && (
        <section className="portfolio-sections">
          <h3>Educational Background</h3>
          <p>{item.education}</p>
        </section>
      )}

      {item.projects && (
        <section className="portfolio-sections">
          <h3>Projects</h3>
          <p>{item.projects}</p>
        </section>
      )}

      {item.experience && (
        <section className="portfolio-sections">
          <h3>Work Experience</h3>
          <p>{item.experience}</p>
        </section>
      )}

      {item.email && (
        <section className="portfolio-sections">
          <h3>Email</h3>
          <p>{item.email}</p>
        </section>
      )}

      {item.contactNumber && (
        <section className="portfolio-sections">
          <h3>Contact Number</h3>
          <p>{item.contactNumber}</p>
        </section>
      )}

      {links.length > 0 && (
        <section className="portfolio-sections">
          <h3>Social Media / Website Links</h3>
          <div className="portfolio-link-list">
            {links.map((link, index) => (
              <a
                href={safeUrl(link)}
                key={`${link}-${index}`}
                target="_blank"
                rel="noreferrer"
              >
                {link}
              </a>
            ))}
          </div>
        </section>
      )}

      {(item.additionalInfo || []).filter(
        (info) => info.heading?.trim() || info.content?.trim()
      ).map((info, index) => (
        <section className="portfolio-sections" key={index}>
          <h3>{info.heading || "Additional Information"}</h3>
          <p>{info.content}</p>
        </section>
      ))}
    </article>
  );
}

function App() {
  const [portfolios, setPortfolios] = useState(readPortfolios);
  const [page, setPage] = useState("home");
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolios));
    } catch {
      setNotice(
        "Could not save. Your browser storage may be full. Try using a smaller profile picture."
      );
    }
  }, [portfolios]);

  const selectedPortfolio = portfolios.find(
    (portfolio) => portfolio.id === selectedId
  );

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function startCreating(template = "simple") {
    setForm({ ...emptyForm, template });
    setEditingId(null);
    setSelectedId(null);
    setNotice("");
    setPage("create");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function editPortfolio(portfolio) {
    setForm({
      ...emptyForm,
      ...portfolio,
      additionalInfo: portfolio.additionalInfo || [],
    });
    setEditingId(portfolio.id);
    setSelectedId(null);
    setNotice("");
    setPage("create");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handlePicture(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setNotice("Please choose an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 1.5 * 1024 * 1024) {
      setNotice("Please choose an image smaller than 1.5 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({
        ...current,
        profilePicture: String(reader.result || ""),
      }));
      setNotice("");
    };
    reader.onerror = () => setNotice("Unable to read this image.");
    reader.readAsDataURL(file);
  }

  function addAdditionalInfo() {
    setForm((current) => ({
      ...current,
      additionalInfo: [
        ...current.additionalInfo,
        { heading: "", content: "" },
      ],
    }));
  }

  function updateAdditionalInfo(index, field, value) {
    setForm((current) => ({
      ...current,
      additionalInfo: current.additionalInfo.map((info, i) =>
        i === index ? { ...info, [field]: value } : info
      ),
    }));
  }

  function removeAdditionalInfo(index) {
    setForm((current) => ({
      ...current,
      additionalInfo: current.additionalInfo.filter((_, i) => i !== index),
    }));
  }

  function savePortfolio(event) {
    event.preventDefault();

    if (!form.name.trim() || !form.title.trim()) {
      setNotice("Please enter your full name and professional title.");
      return;
    }

    const now = new Date().toISOString();
    const oldPortfolio = portfolios.find((item) => item.id === editingId);

    const portfolio = {
      ...form,
      name: form.name.trim(),
      title: form.title.trim(),
      id: editingId || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: oldPortfolio?.createdAt || now,
      updatedAt: now,
    };

    const nextPortfolios = editingId
      ? portfolios.map((item) => (item.id === editingId ? portfolio : item))
      : [portfolio, ...portfolios];

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextPortfolios));
      setPortfolios(nextPortfolios);
      setSelectedId(portfolio.id);
      setEditingId(null);
      setNotice("Portfolio saved successfully!");
      setPage("manage");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setNotice(
        "Unable to save. The profile picture may be too large, or browser storage may be full."
      );
    }
  }

  function deletePortfolio(id) {
    if (!window.confirm("Are you sure you want to delete this portfolio?")) {
      return;
    }

    const nextPortfolios = portfolios.filter((item) => item.id !== id);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextPortfolios));
      setPortfolios(nextPortfolios);
      setSelectedId(null);
      setNotice("Portfolio deleted.");
    } catch {
      setNotice("Unable to update saved portfolios.");
    }
  }

  function showManage() {
    setSelectedId(null);
    setNotice("");
    setPage("manage");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="app-shell">
      <nav className="navbar">
        <button className="brand" onClick={() => setPage("home")}>
          <span className="brand-logo">P</span>
          <span>
            <span className="brand-purple">Portfolio</span>
            <span className="brand-pink">Forge</span>
          </span>
        </button>

        <div className="nav-links">
          <button
            className={`nav-link ${page === "home" ? "active" : ""}`}
            onClick={() => {
              setPage("home");
              setNotice("");
            }}
          >
            ⌂ Home
          </button>
          <button
            className={`nav-link ${page === "create" ? "active" : ""}`}
            onClick={() => startCreating()}
          >
            ↗ Create
          </button>
          <button
            className={`nav-link ${page === "manage" ? "active" : ""}`}
            onClick={showManage}
          >
            ▦ Manage
          </button>
        </div>
      </nav>

      {notice && (
        <div className="notice" role="status">
          <span>{notice}</span>
          <button onClick={() => setNotice("")} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}

      {page === "home" && (
        <main>
          <section className="hero">
            <div className="hero-decoration flower flower-one">✿</div>
            <div className="hero-decoration flower flower-two">✿</div>
            <div className="hero-decoration sparkle sparkle-one">✦</div>
            <div className="hero-decoration sparkle sparkle-two">✧</div>

            <div className="hero-content">
              <div className="hero-badge">
                <span>✧</span> Three templates · Your story · Your style
              </div>
              <h1>
                Build your portfolio,
                <br />
                <span>beautifully.</span>
              </h1>
              <p className="hero-description">
                Bring your skills, education, projects, and experience
                together in one beautiful portfolio. Choose your style and
                make it yours.
              </p>
              <div className="hero-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => startCreating()}
                >
                  ↗ Create Portfolio
                </button>
                <button className="btn btn-outline" onClick={showManage}>
                  ▦ Manage Portfolios
                </button>
              </div>
              <div className="hero-trust">
                <span>✦ Easy to use</span>
                <span>♡ Three unique templates</span>
                <span>✓ Editable anytime</span>
              </div>
            </div>
          </section>

          <section className="home-section">
            <div className="section-heading">
              <span className="eyebrow">YOUR STYLE, YOUR STORY</span>
              <h2>Choose your look</h2>
              <p>One set of information. Three beautiful designs.</p>
            </div>

            <div className="template-gallery">
              {templates.map((template, index) => (
                <button
                  key={template.id}
                  className={`gallery-card template-${template.id}`}
                  onClick={() => startCreating(template.id)}
                >
                  <div className="gallery-art">
                    <div className="mini-window">
                      <div className="mini-top"><i /><i /><i /></div>
                      <div className="mini-content">
                        <div className="mini-avatar" />
                        <div className="mini-line mini-line-long" />
                        <div className="mini-line mini-line-short" />
                        <div className="mini-blocks"><i /><i /><i /></div>
                      </div>
                    </div>
                    <span className="gallery-number">0{index + 1}</span>
                  </div>
                  <div className="gallery-info">
                    <div>
                      <h3>{template.name}</h3>
                      <p>{template.description}</p>
                    </div>
                    <span className="gallery-arrow">↗</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="how-section">
            <div className="section-heading">
              <span className="eyebrow">THREE SIMPLE STEPS</span>
              <h2>Your portfolio, made easy</h2>
            </div>
            <div className="steps-grid">
              <div className="step-card">
                <span className="step-icon step-pink">✎</span>
                <h3>Add your details</h3>
                <p>Enter your personal information, skills, and achievements.</p>
              </div>
              <div className="step-card">
                <span className="step-icon step-purple">✧</span>
                <h3>Choose a template</h3>
                <p>Preview three designs and choose your favorite.</p>
              </div>
              <div className="step-card">
                <span className="step-icon step-blue">♡</span>
                <h3>Save your work</h3>
                <p>Save, edit, manage, and print your portfolio.</p>
              </div>
            </div>
          </section>
        </main>
      )}

      {page === "create" && (
        <main className="page-content">
          <div className="page-heading">
            <span className="eyebrow">LET'S GET STARTED</span>
            <h1>{editingId ? "Edit your portfolio" : "Create your portfolio"}</h1>
            <p>Complete your details, choose a template, and preview the result.</p>
          </div>

          <form className="portfolio-form" onSubmit={savePortfolio}>
            <section className="form-section">
              <div className="form-section-heading">
                <span className="form-icon">01</span>
                <div>
                  <h2>Portfolio Information</h2>
                  <p>Fields marked * are required.</p>
                </div>
              </div>

              <div className="form-grid">
                <label className="field">
                  <span>Full Name *</span>
                  <input name="name" value={form.name} onChange={updateField}
                    placeholder="Enter your full name" required />
                </label>

                <label className="field">
                  <span>Professional Title *</span>
                  <input name="title" value={form.title} onChange={updateField}
                    placeholder="e.g. IT Student / Web Developer" required />
                </label>

                <div className="field field-full">
                  <span>Profile Picture</span>
                  <div className="picture-upload">
                    {form.profilePicture ? (
                      <img src={form.profilePicture} alt="Profile preview" />
                    ) : (
                      <div className="picture-placeholder">♡</div>
                    )}
                    <div className="picture-upload-controls">
                      <label className="btn btn-outline upload-button">
                        Choose Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePicture}
                          hidden
                        />
                      </label>
                      <small>JPG, PNG, or another image format. Maximum 1.5 MB.</small>
                      {form.profilePicture && (
                        <button
                          type="button"
                          className="text-button"
                          onClick={() =>
                            setForm((current) => ({ ...current, profilePicture: "" }))
                          }
                        >
                          Remove picture
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <label className="field">
                  <span>Email</span>
                  <input type="email" name="email" value={form.email}
                    onChange={updateField} placeholder="you@example.com" />
                </label>

                <label className="field">
                  <span>Contact Number</span>
                  <input type="tel" name="contactNumber" value={form.contactNumber}
                    onChange={updateField} placeholder="Enter contact number" />
                </label>

                <label className="field field-full">
                  <span>Address</span>
                  <input name="address" value={form.address} onChange={updateField}
                    placeholder="City, province, or address" />
                </label>

                <label className="field field-full">
                  <span>About Me</span>
                  <textarea name="about" value={form.about} onChange={updateField}
                    rows="4" placeholder="Introduce yourself and describe your goals..." />
                </label>

                <label className="field field-full">
                  <span>Educational Background</span>
                  <textarea name="education" value={form.education}
                    onChange={updateField} rows="3"
                    placeholder="School, course, achievements, and graduation year..." />
                </label>

                <label className="field field-full">
                  <span>Skills</span>
                  <input name="skills" value={form.skills} onChange={updateField}
                    placeholder="Java, HTML, CSS, teamwork" />
                  <small>Separate each skill with a comma.</small>
                </label>

                <label className="field field-full">
                  <span>Projects</span>
                  <textarea name="projects" value={form.projects}
                    onChange={updateField} rows="4"
                    placeholder="Describe your projects, your role, and the tools you used..." />
                </label>

                <label className="field field-full">
                  <span>Work Experience</span>
                  <textarea name="experience" value={form.experience}
                    onChange={updateField} rows="4"
                    placeholder="Jobs, internships, volunteer work, or relevant experience..." />
                </label>

                <label className="field field-full">
                  <span>Social Media / Website Links</span>
                  <textarea name="links" value={form.links} onChange={updateField}
                    rows="3" placeholder={"Enter one link per line, e.g.\nhttps://github.com/username\nhttps://linkedin.com/in/username"} />
                  <small>Include your website, GitHub, LinkedIn, or other relevant profiles.</small>
                </label>
              </div>
            </section>

            <section className="form-section">
              <div className="form-section-heading">
                <span className="form-icon">02</span>
                <div>
                  <h2>Additional Information</h2>
                  <p>Add other sections if needed, such as awards or certifications.</p>
                </div>
              </div>

              {form.additionalInfo.map((info, index) => (
                <div className="additional-info-item" key={index}>
                  <label className="field">
                    <span>Section Title</span>
                    <input value={info.heading}
                      onChange={(event) =>
                        updateAdditionalInfo(index, "heading", event.target.value)
                      }
                      placeholder="e.g. Certifications, Awards, Languages" />
                  </label>
                  <label className="field">
                    <span>Details</span>
                    <textarea value={info.content} rows="3"
                      onChange={(event) =>
                        updateAdditionalInfo(index, "content", event.target.value)
                      }
                      placeholder="Enter details for this section..." />
                  </label>
                  <button type="button" className="text-button remove-info"
                    onClick={() => removeAdditionalInfo(index)}>
                    Remove section ×
                  </button>
                </div>
              ))}

              <button type="button" className="btn btn-outline"
                onClick={addAdditionalInfo}>
                + Add Additional Information
              </button>
            </section>

            <section className="form-section">
              <div className="form-section-heading">
                <span className="form-icon">03</span>
                <div>
                  <h2>Choose Your Template</h2>
                  <p>Select a design to update your preview instantly.</p>
                </div>
              </div>

              <div className="template-options">
                {templates.map((template) => (
                  <button type="button" key={template.id}
                    className={`template-choice template-${template.id} ${
                      form.template === template.id ? "selected" : ""
                    }`}
                    onClick={() =>
                      setForm((current) => ({ ...current, template: template.id }))
                    }
                    aria-pressed={form.template === template.id}>
                    <div className="template-thumb">
                      <div className="thumb-header">
                        <span className="thumb-avatar" />
                        <span className="thumb-lines"><i /><i /></span>
                      </div>
                      <div className="thumb-content"><i /><i /><i /></div>
                      <div className="thumb-footer"><i /><i /><i /></div>
                    </div>
                    <div className="template-choice-info">
                      <span className="template-name">{template.name}</span>
                      <span className="template-description">{template.description}</span>
                    </div>
                    <span className="template-check">
                      {form.template === template.id ? "✓ Selected" : "Choose"}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section className="form-section preview-section">
              <div className="form-section-heading">
                <span className="form-icon">04</span>
                <div>
                  <h2>Live Preview</h2>
                  <p>Your portfolio updates as you type.</p>
                </div>
              </div>
              <PortfolioPreview item={form} />
            </section>

            <div className="form-actions">
              <button type="button" className="btn btn-muted"
                onClick={() => setPage("home")}>Cancel</button>
              <button type="submit" className="btn btn-primary">
                {editingId ? "✓ Update Portfolio" : "♡ Save Portfolio"}
              </button>
            </div>
          </form>
        </main>
      )}

      {page === "manage" && (
        <main className="page-content manage-page">
          <div className="page-heading">
            <span className="eyebrow">YOUR CREATIONS</span>
            <h1>Manage Portfolios</h1>
            <p>View, edit, and manage your saved portfolio designs.</p>
          </div>

          {selectedPortfolio ? (
            <section className="saved-detail">
              <div className="detail-toolbar">
                <button className="btn btn-muted" onClick={() => setSelectedId(null)}>
                  ← All Portfolios
                </button>
                <div className="detail-actions">
                  <button className="btn btn-outline"
                    onClick={() => editPortfolio(selectedPortfolio)}>✎ Edit</button>
                  <button className="btn btn-primary"
                    onClick={() => window.print()}>↓ Print / Save PDF</button>
                </div>
              </div>
              <PortfolioPreview item={selectedPortfolio} />
            </section>
          ) : portfolios.length === 0 ? (
            <section className="empty-state">
              <div className="empty-illustration">✿</div>
              <h2>Your story starts here</h2>
              <p>You haven't saved any portfolios yet. Create your first one!</p>
              <button className="btn btn-primary" onClick={() => startCreating()}>
                + Create My First Portfolio
              </button>
            </section>
          ) : (
            <>
              <div className="manage-summary">
                <div>
                  <span className="summary-number">{portfolios.length}</span>
                  <span className="summary-label">
                    {portfolios.length === 1 ? "saved portfolio" : "saved portfolios"}
                  </span>
                </div>
                <button className="btn btn-primary" onClick={() => startCreating()}>
                  + New Portfolio
                </button>
              </div>

              <div className="saved-grid">
                {portfolios.map((portfolio) => (
                  <article className="saved-card" key={portfolio.id}>
                    <button className="saved-card-preview"
                      onClick={() => setSelectedId(portfolio.id)}
                      aria-label={`View ${portfolio.name}'s portfolio`}>
                      <PortfolioPreview item={portfolio} />
                      <span className="saved-view-overlay">View Portfolio ↗</span>
                    </button>
                    <div className="saved-card-info">
                      <div>
                        <h3>{portfolio.name}</h3>
                        <p>{portfolio.title}</p>
                        <span className="saved-template-label">
                          {templates.find((t) => t.id === portfolio.template)?.name || "Simple"} template
                        </span>
                      </div>
                      <div className="saved-card-actions">
                        <button className="icon-action" title="Edit"
                          aria-label="Edit portfolio"
                          onClick={() => editPortfolio(portfolio)}>✎</button>
                        <button className="icon-action delete-action" title="Delete"
                          aria-label="Delete portfolio"
                          onClick={() => deletePortfolio(portfolio.id)}>×</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </main>
      )}

      <footer className="app-footer">
        <button className="footer-brand" onClick={() => setPage("home")}>
          <span className="brand-logo">P</span>
          <span><span className="brand-purple">Portfolio</span><span className="brand-pink">Forge</span></span>
        </button>
        <p>Made with ♡ to help you show your best self.</p>
        <span className="footer-note">Your skills. Your story. Your style.</span>
      </footer>
    </div>
  );
}

export default App;
