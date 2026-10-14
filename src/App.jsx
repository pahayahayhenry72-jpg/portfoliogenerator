
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
  {
    id: "simple",
    name: "Simple",
    description: "Clean and professional",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Fresh and organized",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Colorful and expressive",
  },
];

function readPortfolios() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
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

  return (
    <article className={`live-preview preview-${item.template || "simple"}`}>
      <div className="preview-top">
        {item.profilePicture ? (
          <img
            className="preview-avatar"
            src={item.profilePicture}
            alt={item.name || "Profile"}
          />
        ) : (
          <div className="preview-avatar preview-avatar-placeholder">
            {item.name?.trim()?.charAt(0)?.toUpperCase() || "P"}
          </div>
        )}

        <div className="preview-heading">
          <span className="preview-label">MY PORTFOLIO</span>
          <h2>{item.name || "Your Name"}</h2>
          <p className="preview-job-title">
            {item.title || "Your Professional Title"}
          </p>
          {item.address && (
            <p className="preview-location">{item.address}</p>
          )}
        </div>
      </div>

      <div className="preview-divider" />

      <section className="preview-section">
        <h3>About Me</h3>
        <p>{item.about || "Write something about yourself here."}</p>
      </section>

      <section className="preview-section">
        <h3>Educational Background</h3>
        <p>{item.education || "Add your educational background."}</p>
      </section>

      <section className="preview-section">
        <h3>Skills</h3>
        {skills.length ? (
          <div className="preview-skills">
            {skills.map((skill, index) => (
              <span className="preview-skill" key={`${skill}-${index}`}>
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p>Add skills separated by commas.</p>
        )}
      </section>

      <section className="preview-section">
        <h3>Projects</h3>
        <p>{item.projects || "Your projects will appear here."}</p>
      </section>

      <section className="preview-section">
        <h3>Work Experience</h3>
        <p>{item.experience || "Add your work experience."}</p>
      </section>

      {(item.email || item.contactNumber) && (
        <section className="preview-section">
          <h3>Contact Information</h3>
          {item.email && <p>Email: {item.email}</p>}
          {item.contactNumber && <p>Contact: {item.contactNumber}</p>}
        </section>
      )}

      {links.length > 0 && (
        <section className="preview-section">
          <h3>Social Media / Website Links</h3>
          <ul className="preview-links">
            {links.map((link, index) => {
              const href = /^https?:\/\//i.test(link)
                ? link
                : `https://${link}`;

              return (
                <li key={`${link}-${index}`}>
                  <a href={href} target="_blank" rel="noreferrer">
                    {link}
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {item.additionalInfo?.length > 0 && (
        <section className="preview-section">
          <h3>Additional Information</h3>
          {item.additionalInfo.map((info, index) => (
            <div className="preview-extra" key={info.id || index}>
              <strong>{info.title || "Additional Detail"}</strong>
              <p>{info.content}</p>
            </div>
          ))}
        </section>
      )}
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
      setNotice("Storage is full. Try using a smaller profile picture.");
    }
  }, [portfolios]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const startCreating = (template = "simple") => {
    setForm({ ...emptyForm, template });
    setEditingId(null);
    setNotice("");
    setPage("create");
  };

  const editPortfolio = (item) => {
    setForm({ ...emptyForm, ...item });
    setEditingId(item.id);
    setNotice("");
    setPage("create");
  };

  const handlePicture = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setNotice("Please select an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 1.5 * 1024 * 1024) {
      setNotice("Please choose a picture smaller than 1.5 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      updateField("profilePicture", reader.result);
      setNotice("");
    };

    reader.onerror = () => setNotice("Could not read that picture.");
    reader.readAsDataURL(file);
  };

  const addAdditionalInfo = () => {
    setForm((current) => ({
      ...current,
      additionalInfo: [
        ...(current.additionalInfo || []),
        {
          id: `${Date.now()}-${Math.random()}`,
          title: "",
          content: "",
        },
      ],
    }));
  };

  const updateAdditionalInfo = (id, field, value) => {
    setForm((current) => ({
      ...current,
      additionalInfo: current.additionalInfo.map((info) =>
        info.id === id ? { ...info, [field]: value } : info
      ),
    }));
  };

  const removeAdditionalInfo = (id) => {
    setForm((current) => ({
      ...current,
      additionalInfo: current.additionalInfo.filter(
        (info) => info.id !== id
      ),
    }));
  };

  const savePortfolio = (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.title.trim()) {
      setNotice("Please enter your full name and professional title.");
      return;
    }

    const item = {
      ...form,
      id: editingId || `${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };

    setPortfolios((current) =>
      editingId
        ? current.map((portfolio) =>
            portfolio.id === editingId ? item : portfolio
          )
        : [item, ...current]
    );

    setSelectedId(item.id);
    setEditingId(null);
    setNotice("Portfolio saved successfully!");
    setPage("manage");
  };

  const deletePortfolio = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this portfolio?"
    );

    if (!confirmed) return;

    setPortfolios((current) =>
      current.filter((portfolio) => portfolio.id !== id)
    );

    if (selectedId === id) setSelectedId(null);
    setNotice("Portfolio deleted.");
  };

  const showManage = () => {
    setNotice("");
    setPage("manage");
  };

  const selectedPortfolio =
    portfolios.find((item) => item.id === selectedId) ||
    portfolios[0] ||
    null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <button
          className="brand"
          type="button"
          onClick={() => setPage("home")}
        >
          <span className="brand-icon">P</span>
          <span>PortfolioForge</span>
        </button>

        <nav className="main-nav">
          <button
            className={page === "home" ? "nav-link active" : "nav-link"}
            onClick={() => setPage("home")}
            type="button"
          >
            Home
          </button>
          <button
            className={page === "create" ? "nav-link active" : "nav-link"}
            onClick={() => startCreating()}
            type="button"
          >
            Create Portfolio
          </button>
          <button
            className={page === "manage" ? "nav-link active" : "nav-link"}
            onClick={showManage}
            type="button"
          >
            My Portfolios
          </button>
        </nav>
      </header>

      {notice && (
        <div className="notice" role="status">
          <span>{notice}</span>
          <button
            type="button"
            aria-label="Dismiss message"
            onClick={() => setNotice("")}
          >
            ×
          </button>
        </div>
      )}

      <main className="page-content">
        {page === "home" && (
          <section className="home-page">
            <div className="hero">
              <span className="eyebrow">YOUR WORK. YOUR STORY.</span>
              <h1>Build a portfolio that represents you.</h1>
              <p>
                Create a personal portfolio, add your information, choose a
                design, and preview your work before saving it.
              </p>
              <button
                className="primary-button"
                type="button"
                onClick={() => startCreating()}
              >
                Create My Portfolio
              </button>
            </div>

            <section className="template-gallery">
              <div className="section-heading centered">
                <span className="eyebrow">CHOOSE YOUR STYLE</span>
                <h2>Three simple templates</h2>
                <p>Select a template to start building your portfolio.</p>
              </div>

              <div className="template-options home-template-options">
                {templates.map((template) => (
                  <button
                    type="button"
                    className="template-choice"
                    key={template.id}
                    onClick={() => startCreating(template.id)}
                  >
                    <TemplateThumbnail template={template.id} />
                    <span className="template-name">{template.name}</span>
                    <span className="template-description">
                      {template.description}
                    </span>
                    <span className="template-select">Use template →</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="how-it-works">
              <div className="section-heading centered">
                <span className="eyebrow">GET STARTED</span>
                <h2>How it works</h2>
              </div>
              <div className="steps-grid">
                <div className="step-card">
                  <span className="step-number">01</span>
                  <h3>Fill in your details</h3>
                  <p>Add your profile, education, skills, and projects.</p>
                </div>
                <div className="step-card">
                  <span className="step-number">02</span>
                  <h3>Choose a design</h3>
                  <p>Pick Simple, Modern, or Creative.</p>
                </div>
                <div className="step-card">
                  <span className="step-number">03</span>
                  <h3>Preview and save</h3>
                  <p>Review your portfolio and save it for later.</p>
                </div>
              </div>
            </section>
          </section>
        )}

        {page === "create" && (
          <section className="create-page">
            <div className="page-heading">
              <div>
                <span className="eyebrow">
                  {editingId ? "UPDATE YOUR DETAILS" : "BUILD YOUR PROFILE"}
                </span>
                <h1>{editingId ? "Edit Portfolio" : "Create Your Portfolio"}</h1>
                <p>Complete the form and see your changes in the live preview.</p>
              </div>
              <button className="secondary-button" onClick={showManage} type="button">
                My Portfolios
              </button>
            </div>

            <div className="editor-layout">
              <form className="portfolio-form" onSubmit={savePortfolio}>
                <section className="form-section">
                  <div className="form-section-heading">
                    <span className="section-icon">01</span>
                    <div>
                      <h2>Portfolio Information</h2>
                      <p>Enter your personal and professional details.</p>
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="profilePicture">Profile Picture</label>
                    <input
                      id="profilePicture"
                      type="file"
                      accept="image/*"
                      onChange={handlePicture}
                    />
                    <small>Choose an image smaller than 1.5 MB.</small>
                    {form.profilePicture && (
                      <div className="upload-preview">
                        <img src={form.profilePicture} alt="Selected profile" />
                        <button
                          type="button"
                          className="text-button danger-text"
                          onClick={() => updateField("profilePicture", "")}
                        >
                          Remove picture
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="form-grid">
                    <div className="field">
                      <label htmlFor="name">Full Name *</label>
                      <input
                        id="name"
                        value={form.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="title">Professional Title *</label>
                      <input
                        id="title"
                        value={form.title}
                        onChange={(e) => updateField("title", e.target.value)}
                        placeholder="e.g. IT Student"
                        required
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="email">Email Address</label>
                      <input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        placeholder="you@example.com"
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="contactNumber">Contact Number</label>
                      <input
                        id="contactNumber"
                        type="tel"
                        value={form.contactNumber}
                        onChange={(e) =>
                          updateField("contactNumber", e.target.value)
                        }
                        placeholder="Enter contact number"
                      />
                    </div>

                    <div className="field field-full">
                      <label htmlFor="address">Address</label>
                      <input
                        id="address"
                        value={form.address}
                        onChange={(e) => updateField("address", e.target.value)}
                        placeholder="City or complete address"
                      />
                    </div>

                    <div className="field field-full">
                      <label htmlFor="about">About Me</label>
                      <textarea
                        id="about"
                        rows="4"
                        value={form.about}
                        onChange={(e) => updateField("about", e.target.value)}
                        placeholder="Write a short introduction about yourself..."
                      />
                    </div>

                    <div className="field field-full">
                      <label htmlFor="education">Educational Background</label>
                      <textarea
                        id="education"
                        rows="3"
                        value={form.education}
                        onChange={(e) =>
                          updateField("education", e.target.value)
                        }
                        placeholder="School, course, and year level"
                      />
                    </div>

                    <div className="field field-full">
                      <label htmlFor="skills">Skills</label>
                      <input
                        id="skills"
                        value={form.skills}
                        onChange={(e) => updateField("skills", e.target.value)}
                        placeholder="HTML, CSS, Communication"
                      />
                      <small>Separate each skill with a comma.</small>
                    </div>

                    <div className="field field-full">
                      <label htmlFor="projects">Projects</label>
                      <textarea
                        id="projects"
                        rows="3"
                        value={form.projects}
                        onChange={(e) =>
                          updateField("projects", e.target.value)
                        }
                        placeholder="Describe your projects..."
                      />
                    </div>

                    <div className="field field-full">
                      <label htmlFor="experience">Work Experience</label>
                      <textarea
                        id="experience"
                        rows="3"
                        value={form.experience}
                        onChange={(e) =>
                          updateField("experience", e.target.value)
                        }
                        placeholder="Describe your work experience, internship, or relevant activities..."
                      />
                    </div>

                    <div className="field field-full">
                      <label htmlFor="links">Social Media / Website Links</label>
                      <textarea
                        id="links"
                        rows="3"
                        value={form.links}
                        onChange={(e) => updateField("links", e.target.value)}
                        placeholder={"https://github.com/yourname\nhttps://linkedin.com/in/yourname"}
                      />
                      <small>Put each link on a new line.</small>
                    </div>
                  </div>
                </section>

                <section className="form-section">
                  <div className="form-section-heading">
                    <span className="section-icon">02</span>
                    <div>
                      <h2>Additional Information</h2>
                      <p>Add certifications, achievements, or other details.</p>
                    </div>
                  </div>

                  <div className="additional-list">
                    {(form.additionalInfo || []).map((info) => (
                      <div className="additional-item" key={info.id}>
                        <div className="field">
                          <label>Title</label>
                          <input
                            value={info.title}
                            onChange={(e) =>
                              updateAdditionalInfo(
                                info.id,
                                "title",
                                e.target.value
                              )
                            }
                            placeholder="e.g. Certification"
                          />
                        </div>
                        <div className="field">
                          <label>Details</label>
                          <textarea
                            rows="2"
                            value={info.content}
                            onChange={(e) =>
                              updateAdditionalInfo(
                                info.id,
                                "content",
                                e.target.value
                              )
                            }
                            placeholder="Enter details"
                          />
                        </div>
                        <button
                          type="button"
                          className="text-button danger-text"
                          onClick={() => removeAdditionalInfo(info.id)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    className="secondary-button"
                    type="button"
                    onClick={addAdditionalInfo}
                  >
                    + Add Information
                  </button>
                </section>

                <section className="form-section">
                  <div className="form-section-heading">
                    <span className="section-icon">03</span>
                    <div>
                      <h2>Choose Your Template</h2>
                      <p>Select a design for your portfolio.</p>
                    </div>
                  </div>

                  <div className="template-options">
                    {templates.map((template) => (
                      <button
                        type="button"
                        key={template.id}
                        className={
                          form.template === template.id
                            ? "template-choice selected"
                            : "template-choice"
                        }
                        onClick={() => updateField("template", template.id)}
                      >
                        <TemplateThumbnail template={template.id} />
                        <span className="template-name">{template.name}</span>
                        <span className="template-description">
                          {template.description}
                        </span>
                        {form.template === template.id && (
                          <span className="selected-label">✓ Selected</span>
                        )}
                      </button>
                    ))}
                  </div>
                </section>

                <div className="form-actions">
                  <button className="primary-button" type="submit">
                    {editingId ? "Update Portfolio" : "Save Portfolio"}
                  </button>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={showManage}
                  >
                    Cancel
                  </button>
                </div>
              </form>

              <aside className="preview-panel">
                <div className="preview-panel-heading">
                  <div>
                    <span className="eyebrow">LIVE PREVIEW</span>
                    <h2>Your Portfolio</h2>
                  </div>
                  <span className="live-indicator">● Live</span>
                </div>
                <p className="preview-help">
                  Changes appear here as you fill out the form.
                </p>
                <PortfolioPreview item={form} />
              </aside>
            </div>
          </section>
        )}

        {page === "manage" && (
          <section className="manage-page">
            <div className="page-heading">
              <div>
                <span className="eyebrow">YOUR WORKSPACE</span>
                <h1>My Portfolios</h1>
                <p>View, edit, print, or delete your saved portfolios.</p>
              </div>
              <button
                className="primary-button"
                type="button"
                onClick={() => startCreating()}
              >
                + Create New
              </button>
            </div>

            {portfolios.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">✦</div>
                <h2>No portfolios yet</h2>
                <p>Create your first portfolio to see it here.</p>
                <button
                  className="primary-button"
                  type="button"
                  onClick={() => startCreating()}
                >
                  Create Portfolio
                </button>
              </div>
            ) : (
              <div className="manage-layout">
                <div className="saved-list">
                  <div className="manage-summary">
                    <strong>{portfolios.length} portfolio(s)</strong>
                    <span>Saved in this browser</span>
                  </div>

                  <div className="saved-grid">
                    {portfolios.map((item) => (
                      <article
                        className={
                          selectedPortfolio?.id === item.id
                            ? "saved-card selected"
                            : "saved-card"
                        }
                        key={item.id}
                      >
                        <button
                          type="button"
                          className="saved-card-select"
                          onClick={() => setSelectedId(item.id)}
                        >
                          {item.profilePicture ? (
                            <img
                              className="saved-avatar"
                              src={item.profilePicture}
                              alt=""
                            />
                          ) : (
                            <span className="saved-avatar saved-avatar-empty">
                              {item.name?.charAt(0)?.toUpperCase() || "P"}
                            </span>
                          )}
                          <span className="saved-card-text">
                            <strong>{item.name}</strong>
                            <span>{item.title}</span>
                            <small>
                              {templates.find(
                                (template) => template.id === item.template
                              )?.name || "Simple"}{" "}
                              template
                            </small>
                          </span>
                        </button>

                        <div className="saved-card-actions">
                          <button
                            type="button"
                            className="text-button"
                            onClick={() => editPortfolio(item)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="text-button danger-text"
                            onClick={() => deletePortfolio(item.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

                {selectedPortfolio && (
                  <section className="saved-detail">
                    <div className="saved-detail-heading">
                      <div>
                        <span className="eyebrow">PORTFOLIO DETAILS</span>
                        <h2>{selectedPortfolio.name}</h2>
                      </div>
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => window.print()}
                      >
                        Print / PDF
                      </button>
                    </div>
                    <PortfolioPreview item={selectedPortfolio} />
                  </section>
                )}
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="app-footer">
        <span className="brand-icon footer-brand-icon">P</span>
        <span>PortfolioForge</span>
        <span className="footer-note">Build your story, one section at a time.</span>
      </footer>
    </div>
  );
}

function TemplateThumbnail({ template }) {
  return (
    <span className={`template-thumb thumb-${template}`}>
      <span className="thumb-header">
        <span className="thumb-avatar" />
        <span className="thumb-heading-lines">
          <span />
          <span />
        </span>
      </span>
      <span className="thumb-content">
        <span />
        <span />
        <span />
        <span />
      </span>
    </span>
  );
}

export default App;
