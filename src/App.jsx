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
  additionalInfo: "",
};

const templates = {
  simple: "Simple",
  modern: "Modern",
  creative: "Creative",
};

function lines(value = "") {
  return value.split("\n").map((x) => x.trim()).filter(Boolean);
}

function PortfolioPreview({ form, template }) {
  return (
    <article className={`portfolio-preview preview-${template}`}>
      <header className="preview-header">
        {form.profilePicture && (
          <img
            className="preview-profile-picture"
            src={form.profilePicture}
            alt="Profile"
          />
        )}
        <div>
          <p className="preview-label">PERSONAL PORTFOLIO</p>
          <h1>{form.name || "Your Full Name"}</h1>
          <h2>{form.title || "Your Professional Title"}</h2>
          {[form.email, form.contactNumber, form.address]
            .filter(Boolean)
            .map((item, i) => <p key={i}>{item}</p>)}
        </div>
      </header>

      {[
        ["About Me", form.about, false],
        ["Educational Background", form.education, true],
        ["Skills", form.skills, true],
        ["Projects", form.projects, true],
        ["Work Experience", form.experience, true],
        ["Social Media / Website Links", form.links, true],
        ["Additional Information", form.additionalInfo, true],
      ].map(([heading, value, isList]) => (
        <section className="preview-section" key={heading}>
          <h3>{heading}</h3>
          {isList ? (
            lines(value).length ? (
              heading === "Social Media / Website Links" ? (
                <ul>
                  {lines(value).map((link, i) => (
                    <li key={i}>
                      {/^https?:\/\//i.test(link) ? (
                        <a href={link} target="_blank" rel="noreferrer">
                          {link}
                        </a>
                      ) : link}
                    </li>
                  ))}
                </ul>
              ) : heading === "Skills" ? (
                <div className="preview-skills">
                  {lines(value).map((skill, i) => <span key={i}>{skill}</span>)}
                </div>
              ) : (
                <ul>
                  {lines(value).map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              )
            ) : (
              <p>{heading === "Additional Information" ? " " : `Add your ${heading.toLowerCase()}.`}</p>
            )
          ) : (
            <p>{value || "Write something about yourself here."}</p>
          )}
        </section>
      ))}
      <footer className="preview-footer">Created with BloomFolio</footer>
    </article>
  );
}

export default function App() {
  const [page, setPage] = useState("home");
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ ...emptyForm });
  const [template, setTemplate] = useState("simple");
  const [portfolios, setPortfolios] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (Array.isArray(saved)) setPortfolios(saved);
    } catch {
      setPortfolios([]);
    }
  }, []);

  function persistPortfolios(updated) {
    setPortfolios(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      setError("Unable to save. Your browser storage may be full.");
    }
  }

  function startNewPortfolio() {
    setForm({ ...emptyForm });
    setTemplate("simple");
    setEditingId(null);
    setSelectedPortfolio(null);
    setStep(1);
    setMessage("");
    setError("");
    setPage("create");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handlePicture(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 1.5 * 1024 * 1024) {
      setError("Please choose an image smaller than 1.5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({
        ...current,
        profilePicture: String(reader.result),
      }));
      setError("");
    };
    reader.onerror = () => setError("Could not read this image.");
    reader.readAsDataURL(file);
  }

  function savePortfolio(event) {
    event?.preventDefault();
    setError("");
    setMessage("");

    if (!form.name.trim()) {
      setError("Please enter your full name.");
      setStep(1);
      return;
    }

    const portfolio = {
      id: editingId ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: form.name.trim(),
      title: form.title.trim(),
      form: { ...form },
      template,
      updatedAt: new Date().toISOString(),
    };

    const updated =
      editingId !== null
        ? portfolios.map((item) => item.id === editingId ? portfolio : item)
        : [portfolio, ...portfolios];

    persistPortfolios(updated);
    setEditingId(portfolio.id);
    setSelectedPortfolio(null);
    setMessage(editingId !== null ? "Portfolio updated successfully!" : "Portfolio saved successfully!");
    setPage("manage");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function editPortfolio(portfolio) {
    setForm({ ...emptyForm, ...(portfolio.form || {}) });
    setTemplate(portfolio.template || "simple");
    setEditingId(portfolio.id);
    setSelectedPortfolio(null);
    setStep(1);
    setMessage("");
    setError("");
    setPage("create");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deletePortfolio(id) {
    if (!window.confirm("Are you sure you want to delete this portfolio?")) return;

    const updated = portfolios.filter((item) => item.id !== id);
    persistPortfolios(updated);
    if (selectedPortfolio?.id === id) setSelectedPortfolio(null);
    setMessage("Portfolio deleted.");
    setError("");
  }

  function openManage() {
    setPage("manage");
    setSelectedPortfolio(null);
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="app-shell">
      <header className="app-header no-print">
        <button
          className="brand"
          onClick={() => {
            setPage("home");
            setSelectedPortfolio(null);
            setMessage("");
            setError("");
          }}
        >
          <span className="brand-icon">✿</span> BloomFolio
        </button>

        <nav className="header-actions">
          <button
            className={`nav-button ${page === "home" ? "active" : ""}`}
            onClick={() => setPage("home")}
          >
            Home
          </button>
          <button
            className={`nav-button ${page === "manage" ? "active" : ""}`}
            onClick={openManage}
          >
            My Portfolios
          </button>
          <button className="btn btn-primary" onClick={startNewPortfolio}>
            + New Portfolio
          </button>
        </nav>
      </header>

      {(message || error) && (
        <div className={`notice ${error ? "notice-error" : "notice-success"}`}>
          <span>{error || message}</span>
          <button
            className="notice-close"
            onClick={() => { setMessage(""); setError(""); }}
          >
            ×
          </button>
        </div>
      )}

      {page === "home" && (
        <main className="home-page no-print">
          <section className="home-hero">
            <div className="hero-copy">
              <span className="eyebrow">YOUR STORY, YOUR STYLE</span>
              <h1>Build a portfolio <span>that feels like you.</span></h1>
              <p>
                Create your personal portfolio, choose a design, and preview
                your information before saving it in your browser.
              </p>
              <div className="hero-actions">
                <button className="btn btn-primary btn-large" onClick={startNewPortfolio}>
                  + Create New Portfolio
                </button>
                <button className="btn btn-light btn-large" onClick={openManage}>
                  My Portfolios
                </button>
              </div>
              <p className="hero-note">✦ Three unique designs · Live preview · Easy to use</p>
            </div>

            <div className="hero-art">
              <div className="art-orbit orbit-one" />
              <div className="art-orbit orbit-two" />
              <div className="art-card art-card-back">
                <div className="art-bar" />
                <div className="art-line" />
                <div className="art-line short" />
                <div className="art-grid"><span /><span /><span /></div>
              </div>
              <div className="art-card art-card-front">
                <div className="art-avatar">✿</div>
                <div className="art-mini-title">YOUR NAME</div>
                <div className="art-mini-subtitle">Personal Portfolio</div>
                <div className="art-mini-line" />
                <div className="art-mini-line short" />
                <div className="art-pills"><span /><span /><span /></div>
              </div>
              <span className="art-star star-one">✦</span>
              <span className="art-star star-two">✿</span>
            </div>
          </section>

          <section className="home-features">
            <div className="section-heading">
              <span className="eyebrow">HOW IT WORKS</span>
              <h2>From blank page to portfolio</h2>
              <p>Three simple steps to bring your information together.</p>
            </div>
            <div className="feature-grid">
              <article className="feature-card">
                <span className="feature-icon icon-purple">01</span>
                <h3>Fill in your details</h3>
                <p>Add your contact details, education, skills, projects, and experience.</p>
              </article>
              <article className="feature-card">
                <span className="feature-icon icon-blue">02</span>
                <h3>Choose your style</h3>
                <p>Pick Simple, Modern, or Creative to match your personal style.</p>
              </article>
              <article className="feature-card">
                <span className="feature-icon icon-orange">03</span>
                <h3>Preview and save</h3>
                <p>Check your portfolio, save it in your browser, or print it as a PDF.</p>
              </article>
            </div>
          </section>
        </main>
      )}

      {page === "create" && (
        <main className="main-container no-print">
          <div className="page-heading">
            <div>
              <span className="eyebrow">PORTFOLIO BUILDER</span>
              <h1>{editingId !== null ? "Edit Portfolio" : "Create Your Portfolio"}</h1>
              <p>Fill in your information, select a style, and preview your portfolio.</p>
            </div>
            <button className="btn btn-light" onClick={openManage}>← My Portfolios</button>
          </div>

          <div className="workflow-steps">
            {[
              ["Fill Up", "Your information"],
              ["Choose Template", "Select a design"],
              ["Preview & Save", "Review your work"],
            ].map(([title, description], index) => {
              const number = index + 1;
              return (
                <button
                  type="button"
                  key={title}
                  className={`workflow-step ${step === number ? "current" : ""} ${step > number ? "done" : ""}`}
                  onClick={() => setStep(number)}
                >
                  <span className="step-number">{step > number ? "✓" : number}</span>
                  <span className="step-text">
                    <strong>{title}</strong>
                    <small>{description}</small>
                  </span>
                </button>
              );
            })}
          </div>

          {step === 1 && (
            <section className="workflow-panel">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">STEP 1 OF 3</span>
                  <h2>Fill Up Information</h2>
                  <p>Enter your details below. Fields marked with * are required.</p>
                </div>
                <span className="panel-flower">✿</span>
              </div>

              <form
                className="portfolio-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!form.name.trim()) {
                    setError("Please enter your full name.");
                    return;
                  }
                  setError("");
                  setStep(2);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                <div className="form-section-title">
                  <span className="form-section-icon">01</span>
                  <div><h3>Personal Information</h3><p>Basic information people can use to contact you.</p></div>
                </div>

                <div className="form-grid">
                  <label className="form-field">
                    <span>Full Name <b>*</b></span>
                    <input name="name" value={form.name} onChange={updateField} placeholder="e.g. Henry Pahayahay" required />
                  </label>
                  <label className="form-field">
                    <span>Professional Title</span>
                    <input name="title" value={form.title} onChange={updateField} placeholder="e.g. IT Student / Web Developer" />
                  </label>
                  <label className="form-field">
                    <span>Email Address</span>
                    <input type="email" name="email" value={form.email} onChange={updateField} placeholder="you@example.com" />
                  </label>
                  <label className="form-field">
                    <span>Contact Number</span>
                    <input name="contactNumber" value={form.contactNumber} onChange={updateField} placeholder="e.g. 09XX XXX XXXX" />
                  </label>
                  <label className="form-field full-width">
                    <span>Address</span>
                    <input name="address" value={form.address} onChange={updateField} placeholder="City or general address" />
                  </label>

                  <div className="form-field full-width">
                    <span>Profile Picture</span>
                    <div className="picture-upload">
                      {form.profilePicture
                        ? <img src={form.profilePicture} alt="Profile preview" />
                        : <div className="picture-placeholder">✿</div>}
                      <div className="picture-upload-copy">
                        <strong>Upload your profile picture</strong>
                        <small>Image file only · Maximum 1.5 MB</small>
                        <label className="btn btn-light upload-button">
                          Choose Image
                          <input type="file" accept="image/*" onChange={handlePicture} hidden />
                        </label>
                      </div>
                      {form.profilePicture && (
                        <button type="button" className="remove-picture" onClick={() => setForm((old) => ({ ...old, profilePicture: "" }))}>
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  <label className="form-field full-width">
                    <span>About Me</span>
                    <textarea name="about" value={form.about} onChange={updateField} rows="4" placeholder="Introduce yourself, your interests, and your goals..." />
                  </label>
                </div>

                <div className="form-section-title">
                  <span className="form-section-icon">02</span>
                  <div><h3>Education and Experience</h3><p>Share what you have learned and accomplished.</p></div>
                </div>

                <div className="form-grid">
                  <label className="form-field full-width">
                    <span>Educational Background</span>
                    <textarea name="education" value={form.education} onChange={updateField} rows="3" placeholder={"One entry per line\nSenior High School — School Name"} />
                  </label>
                  <label className="form-field full-width">
                    <span>Skills</span>
                    <textarea name="skills" value={form.skills} onChange={updateField} rows="3" placeholder={"One skill per line\nHTML\nCSS\nCommunication"} />
                  </label>
                  <label className="form-field full-width">
                    <span>Projects</span>
                    <textarea name="projects" value={form.projects} onChange={updateField} rows="3" placeholder={"One project per line\nStudent Attendance System"} />
                  </label>
                  <label className="form-field full-width">
                    <span>Work Experience</span>
                    <textarea name="experience" value={form.experience} onChange={updateField} rows="3" placeholder="Add work, internship, volunteer, or relevant school experience." />
                  </label>
                  <label className="form-field full-width">
                    <span>Social Media / Website Links</span>
                    <textarea name="links" value={form.links} onChange={updateField} rows="3" placeholder={"One link per line\nhttps://github.com/yourusername"} />
                  </label>
                  <label className="form-field full-width">
                    <span>Additional Information (Optional)</span>
                    <textarea name="additionalInfo" value={form.additionalInfo} onChange={updateField} rows="2" placeholder="Certifications, awards, interests, or other details." />
                  </label>
                </div>

                <div className="form-footer">
                  <span className="form-tip">✦ You can update your details anytime.</span>
                  <button className="btn btn-primary btn-large" type="submit">Choose Template →</button>
                </div>
              </form>
            </section>
          )}

          {step === 2 && (
            <section className="workflow-panel">
              <div className="panel-heading">
                <div><span className="eyebrow">STEP 2 OF 3</span><h2>Choose Your Template</h2><p>Select a design. Each template has its own layout and colors.</p></div>
                <span className="panel-flower">✿</span>
              </div>
              <div className="template-grid">
                {Object.entries(templates).map(([key, name]) => (
                  <button type="button" key={key} className={`template-option ${template === key ? "selected" : ""}`} onClick={() => setTemplate(key)}>
                    <div className={`template-mini template-mini-${key}`}>
                      <div className="mini-top"><span /><span /><span /></div>
                      <div className="mini-content"><div className="mini-avatar" /><div className="mini-lines"><span /><span /><span /></div></div>
                      <div className="mini-bottom"><span /><span /><span /></div>
                    </div>
                    <div className="template-option-info">
                      <div>
                        <strong>{name}</strong>
                        <p>{key === "simple" ? "Clean, classic, and professional." : key === "modern" ? "Bold sections with a modern teal look." : "Expressive colors and creative details."}</p>
                      </div>
                      <span className="template-radio">{template === key ? "✓" : ""}</span>
                    </div>
                  </button>
                ))}
              </div>
              <div className="form-footer">
                <button className="btn btn-light" onClick={() => setStep(1)}>← Back to Information</button>
                <button className="btn btn-primary btn-large" onClick={() => { setStep(3); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Preview Portfolio →</button>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="workflow-panel">
              <div className="panel-heading">
                <div><span className="eyebrow">STEP 3 OF 3</span><h2>Preview Your Portfolio</h2><p>Review your information before saving.</p></div>
                <span className="panel-flower">✿</span>
              </div>
              <div className="preview-toolbar">
                <span className={`template-tag tag-${template}`}>{templates[template]} Template</span>
                <button className="btn btn-light" onClick={() => setStep(2)}>Change Template</button>
              </div>
              <PortfolioPreview form={form} template={template} />
              <div className="form-footer">
                <button className="btn btn-light" onClick={() => setStep(1)}>← Edit Information</button>
                <button className="btn btn-light" onClick={() => window.print()}>Print / Save PDF</button>
                <button className="btn btn-primary btn-large" onClick={savePortfolio}>
                  {editingId !== null ? "Update Portfolio" : "Save Portfolio"}
                </button>
              </div>
            </section>
          )}
        </main>
      )}

      {page === "manage" && (
        <main className="main-container no-print">
          <div className="page-heading">
            <div>
              <span className="eyebrow">YOUR COLLECTION</span>
              <h1>{selectedPortfolio ? "Portfolio Details" : "My Portfolios"}</h1>
              <p>{selectedPortfolio ? "View your saved portfolio." : "View, edit, print, or delete your saved portfolios."}</p>
            </div>
            <button className="btn btn-primary" onClick={startNewPortfolio}>+ New Portfolio</button>
          </div>

          {selectedPortfolio ? (
            <>
              <div className="detail-toolbar">
                <button className="btn btn-light" onClick={() => setSelectedPortfolio(null)}>← All Portfolios</button>
                <div className="detail-actions">
                  <button className="btn btn-light" onClick={() => window.print()}>Print / Save PDF</button>
                  <button className="btn btn-primary" onClick={() => editPortfolio(selectedPortfolio)}>Edit Portfolio</button>
                  <button className="btn btn-danger" onClick={() => deletePortfolio(selectedPortfolio.id)}>Delete</button>
                </div>
              </div>
              <PortfolioPreview form={selectedPortfolio.form || emptyForm} template={selectedPortfolio.template || "simple"} />
            </>
          ) : portfolios.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✿</div>
              <h2>No portfolios yet</h2>
              <p>Create your first portfolio to see it here.</p>
              <button className="btn btn-primary btn-large" onClick={startNewPortfolio}>+ Create Your First Portfolio</button>
            </div>
          ) : (
            <div className="saved-grid">
              {portfolios.map((portfolio) => (
                <article className="saved-card" key={portfolio.id}>
                  <div className={`saved-card-art saved-art-${portfolio.template}`}>
                    {portfolio.form?.profilePicture
                      ? <img className="saved-avatar" src={portfolio.form.profilePicture} alt="" />
                      : <div className="saved-avatar saved-avatar-placeholder">✿</div>}
                    <div className="saved-art-lines"><span /><span /><span /></div>
                    <span className="saved-template-label">{templates[portfolio.template] || "Simple"}</span>
                  </div>
                  <div className="saved-card-content">
                    <span className="saved-kicker">PORTFOLIO</span>
                    <h3>{portfolio.name}</h3>
                    <p>{portfolio.title || "Personal Portfolio"}</p>
                    <div className="saved-card-actions">
                      <button className="btn btn-light" onClick={() => setSelectedPortfolio(portfolio)}>View</button>
                      <button className="btn btn-primary" onClick={() => editPortfolio(portfolio)}>Edit</button>
                      <button className="btn btn-danger" onClick={() => deletePortfolio(portfolio.id)}>Delete</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      )}

      <footer className="app-footer no-print">
        <span className="footer-brand">✿ BloomFolio</span>
        <span>Make your story stand out.</span>
      </footer>
    </div>
  );
}