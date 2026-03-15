import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import "../styles/aihub.css";

const IMPACT_MAP = {
  high: { cls: "badge-green", label: "High Impact" },
  medium: { cls: "badge-yellow", label: "Med Impact" },
  low: { cls: "badge-gray", label: "Low Impact" },
};

const LIKELIHOOD_MAP = {
  high: { cls: "badge-green", label: "High" },
  medium: { cls: "badge-yellow", label: "Medium" },
  low: { cls: "badge-gray", label: "Low" },
};

export default function AIHub() {
  const { company } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [activeTab, setActiveTab] = useState("suggestions");

  // Suggestions state
  const [selCampaign, setSelCampaign] = useState("");
  const [customCtx, setCustomCtx] = useState({
    campaignName: "",
    campaignDescription: "",
    goals: "",
    budget: "",
  });
  const [suggestions, setSuggestions] = useState(null);
  const [loadSug, setLoadSug] = useState(false);
  const [errSug, setErrSug] = useState("");

  // Leads state
  const [selLeadCampaign, setSelLeadCampaign] = useState("");
  const [leads, setLeads] = useState(null);
  const [loadLead, setLoadLead] = useState(false);
  const [errLead, setErrLead] = useState("");

  useEffect(() => {
    api
      .getCampaigns()
      .then((d) => setCampaigns(d.campaigns))
      .catch(console.error);
  }, []);

  const selectedCamp = campaigns.find((c) => c._id === selCampaign);

  const runSuggestions = async () => {
    setErrSug("");
    setLoadSug(true);
    setSuggestions(null);
    try {
      const payload = selectedCamp
        ? {
            campaignId: selectedCamp._id,
            campaignName: selectedCamp.name,
            campaignDescription: selectedCamp.description,
            goals: selectedCamp.goals,
            channels: selectedCamp.channels,
            budget: selectedCamp.budget,
          }
        : {
            ...customCtx,
            budget: customCtx.budget ? Number(customCtx.budget) : undefined,
          };
      const d = await api.getSuggestions(payload);
      setSuggestions(d.data);
    } catch (e) {
      setErrSug(e.message);
    } finally {
      setLoadSug(false);
    }
  };

  const runLeads = async () => {
    setErrLead("");
    setLoadLead(true);
    setLeads(null);
    try {
      const leadCamp = campaigns.find((c) => c._id === selLeadCampaign);
      const payload = leadCamp
        ? {
            campaignId: leadCamp._id,
            campaignName: leadCamp.name,
            channels: leadCamp.channels,
          }
        : {};
      const d = await api.getLeads(payload);
      setLeads(d.data);
    } catch (e) {
      setErrLead(e.message);
    } finally {
      setLoadLead(false);
    }
  };

  return (
    <div className="aihub">
      <div className="aihub-header">
        <div className="aihub-title-row">
          <div className="aihub-icon">✦</div>
          <div>
            <h1 className="page-title">AI Hub</h1>
            <p className="page-sub">
              AI-powered intelligence for{" "}
              <strong>{company?.companyName}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="ai-tabs">
        <button
          className={`ai-tab ${activeTab === "suggestions" ? "active" : ""}`}
          onClick={() => setActiveTab("suggestions")}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          Campaign Suggestions
        </button>
        <button
          className={`ai-tab ${activeTab === "leads" ? "active" : ""}`}
          onClick={() => setActiveTab("leads")}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Lead Generation
        </button>
      </div>

      {/* Suggestions Tab */}
      {activeTab === "suggestions" && (
        <div className="ai-panel-layout">
          <div className="ai-control glass-card">
            <h3 className="control-title">Configure Analysis</h3>
            <p className="control-sub">
              Select a campaign or enter context manually.
            </p>

            <div className="input-group">
              <label className="input-label">Select Campaign (optional)</label>
              <select
                className="select"
                value={selCampaign}
                onChange={(e) => setSelCampaign(e.target.value)}
              >
                <option value="">— Enter manually below —</option>
                {campaigns.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {!selCampaign && (
              <>
                <div className="input-group">
                  <label className="input-label">Campaign Name</label>
                  <input
                    className="input"
                    value={customCtx.campaignName}
                    onChange={(e) =>
                      setCustomCtx({
                        ...customCtx,
                        campaignName: e.target.value,
                      })
                    }
                    placeholder="e.g. Summer Sale 2025"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Description</label>
                  <textarea
                    className="textarea"
                    value={customCtx.campaignDescription}
                    onChange={(e) =>
                      setCustomCtx({
                        ...customCtx,
                        campaignDescription: e.target.value,
                      })
                    }
                    placeholder="What is this campaign about?"
                    style={{ minHeight: 70 }}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Goals</label>
                  <input
                    className="input"
                    value={customCtx.goals}
                    onChange={(e) =>
                      setCustomCtx({ ...customCtx, goals: e.target.value })
                    }
                    placeholder="e.g. Increase brand awareness"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Budget ($)</label>
                  <input
                    className="input"
                    type="number"
                    value={customCtx.budget}
                    onChange={(e) =>
                      setCustomCtx({ ...customCtx, budget: e.target.value })
                    }
                    placeholder="5000"
                  />
                </div>
              </>
            )}

            {errSug && <div className="alert alert-error">{errSug}</div>}

            <button
              className="btn btn-primary btn-full"
              onClick={runSuggestions}
              disabled={loadSug}
            >
              {loadSug ? (
                <>
                  <span className="spinner" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <span>✦</span> Generate Suggestions
                </>
              )}
            </button>
          </div>

          <div className="ai-results">
            {!suggestions && !loadSug && (
              <div className="ai-placeholder glass-card">
                <div className="placeholder-icon">✦</div>
                <h3>Ready to analyze</h3>
                <p>
                  Configure your campaign on the left and click Generate
                  Suggestions to get AI-powered recommendations.
                </p>
              </div>
            )}

            {loadSug && (
              <div className="ai-loading glass-card">
                <div className="loading-orb" />
                <p>AI is analyzing your campaign...</p>
              </div>
            )}

            {suggestions && (
              <div className="results-container">
                <div className="results-meta glass-card">
                  <div className="score-display">
                    <span className="score-number">
                      {suggestions.overallScore}
                    </span>
                    <span className="score-label">/10</span>
                  </div>
                  <div>
                    <div className="score-title">Campaign Score</div>
                    <p className="score-summary">{suggestions.summary}</p>
                  </div>
                </div>

                <div className="suggestions-list">
                  {suggestions.suggestions?.map((s, i) => {
                    const imp = IMPACT_MAP[s.impact] || IMPACT_MAP.medium;
                    return (
                      <div key={i} className="suggestion-card glass-card">
                        <div className="suggestion-header">
                          <span className="suggestion-num">0{i + 1}</span>
                          <h4 className="suggestion-title">{s.title}</h4>
                          <span className={`badge ${imp.cls}`}>
                            {imp.label}
                          </span>
                          {s.category && (
                            <span className="badge badge-violet">
                              {s.category}
                            </span>
                          )}
                        </div>
                        <p className="suggestion-desc">{s.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Leads Tab */}
      {activeTab === "leads" && (
        <div className="ai-panel-layout">
          <div className="ai-control glass-card">
            <h3 className="control-title">Lead Generation</h3>
            <p className="control-sub">
              Generate ideal customer profiles for your campaigns.
            </p>

            <div className="input-group">
              <label className="input-label">Select Campaign (optional)</label>
              <select
                className="select"
                value={selLeadCampaign}
                onChange={(e) => setSelLeadCampaign(e.target.value)}
              >
                <option value="">— Use company profile —</option>
                {campaigns.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="ai-context-box">
              <span className="context-label">Using profile data:</span>
              <span className="context-value">
                <strong>{company?.companyName}</strong>
              </span>
              <span className="context-value">
                Product: {company?.product?.slice(0, 60)}...
              </span>
              <span className="context-value">
                Audience: {company?.targetAudience?.slice(0, 60)}...
              </span>
            </div>

            {errLead && <div className="alert alert-error">{errLead}</div>}

            <button
              className="btn btn-primary btn-full"
              onClick={runLeads}
              disabled={loadLead}
            >
              {loadLead ? (
                <>
                  <span className="spinner" />
                  Generating leads...
                </>
              ) : (
                <>
                  <span>✦</span> Generate Lead Profiles
                </>
              )}
            </button>
          </div>

          <div className="ai-results">
            {!leads && !loadLead && (
              <div className="ai-placeholder glass-card">
                <div className="placeholder-icon">👥</div>
                <h3>Discover your ideal customers</h3>
                <p>
                  Gemini will generate 5 detailed customer personas with
                  acquisition strategies tailored to your business.
                </p>
              </div>
            )}

            {loadLead && (
              <div className="ai-loading glass-card">
                <div className="loading-orb" />
                <p>Building customer profiles...</p>
              </div>
            )}

            {leads && (
              <div className="results-container">
                <div className="results-meta glass-card">
                  <div className="market-info">
                    <span className="market-label">Estimated Reach</span>
                    <span className="market-value">{leads.estimatedReach}</span>
                  </div>
                  <div>
                    <span className="market-label">Top Strategy</span>
                    <p className="score-summary">{leads.topStrategy}</p>
                  </div>
                </div>

                <div className="leads-list">
                  {leads.leads?.map((l, i) => {
                    const lh =
                      LIKELIHOOD_MAP[l.conversionLikelihood] ||
                      LIKELIHOOD_MAP.medium;
                    return (
                      <div key={i} className="lead-card glass-card">
                        <div className="lead-header">
                          <div className="lead-avatar">
                            {l.persona?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div className="lead-title-block">
                            <h4 className="lead-persona">{l.persona}</h4>
                            <span className="lead-demographics">
                              {l.demographics}
                            </span>
                          </div>
                          <div className="lead-badges">
                            <span className={`badge ${lh.cls}`}>
                              {lh.label} conv.
                            </span>
                            {l.channel && (
                              <span className="badge badge-blue">
                                {l.channel}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="lead-body">
                          <div className="lead-section">
                            <span className="lead-section-label">
                              Pain Points
                            </span>
                            <p>{l.painPoints}</p>
                          </div>
                          <div className="lead-section">
                            <span className="lead-section-label">
                              Acquisition Strategy
                            </span>
                            <p>{l.acquisitionStrategy}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
