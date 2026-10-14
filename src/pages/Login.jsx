import { useState } from "react";
import {
    Fingerprint,
    Eye,
    EyeOff,
    ArrowRight,
    ShieldCheck,
    Sparkles,
    CheckCircle2,
} from "lucide-react";
import "../styles/Login.css";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email, password }),
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Unable to log in."
                );
            }

            localStorage.setItem("idFoundryToken", data.token);
            localStorage.setItem(
                "idFoundryUser",
                JSON.stringify(data.user)
            );

            window.location.href = "/";
        } catch (err) {
            setError(
                err.message ||
                "Unable to connect to the server. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="login-page">
            {/* Left branding panel */}
            <section className="login-visual">
                <div className="login-visual-glow login-glow-one" />
                <div className="login-visual-glow login-glow-two" />

                <a className="login-brand" href="/login">
                    <span className="login-brand-icon">
                        <Fingerprint size={27} strokeWidth={1.8} />
                    </span>

                    <span className="login-brand-name">
                        IDFoundry
                    </span>

                    <span className="login-brand-badge">
                        WORKSPACE
                    </span>
                </a>

                <div className="login-visual-content">
                    <div className="login-eyebrow">
                        <Sparkles size={15} />
                        <span>YOUR ID MANAGEMENT WORKSPACE</span>
                    </div>

                    <h1>
                        Every identity.
                        <br />
                        <span>One place.</span>
                    </h1>

                    <p className="login-visual-description">
                        Create, manage and verify ID cards
                        with a workspace designed to keep
                        your organization moving.
                    </p>

                    <div className="login-feature-list">
                        <div className="login-feature">
                            <span className="login-feature-icon">
                                <CheckCircle2 size={18} />
                            </span>
                            <span>Organized ID card management</span>
                        </div>

                        <div className="login-feature">
                            <span className="login-feature-icon">
                                <CheckCircle2 size={18} />
                            </span>
                            <span>Flexible card design workflows</span>
                        </div>

                        <div className="login-feature">
                            <span className="login-feature-icon">
                                <CheckCircle2 size={18} />
                            </span>
                            <span>Streamlined identity verification</span>
                        </div>
                    </div>

                    <div className="login-preview">
                        <div className="login-preview-top">
                            <div className="login-preview-dots">
                                <span />
                                <span />
                                <span />
                            </div>

                            <span className="login-preview-label">
                                YOUR WORKSPACE
                            </span>

                            <ShieldCheck size={17} />
                        </div>

                        <div className="login-preview-content">
                            <div className="login-preview-avatar">
                                <Fingerprint size={25} />
                            </div>

                            <div className="login-preview-text">
                                <strong>Identity management</strong>
                                <span>Everything in its place.</span>
                            </div>

                            <div className="login-preview-status">
                                <span />
                                Organized
                            </div>
                        </div>

                        <div className="login-preview-lines">
                            <span />
                            <span />
                            <span />
                        </div>
                    </div>
                </div>

                <div className="login-visual-footer">
                    <span>CREATE.</span>
                    <span>VERIFY.</span>
                    <span>IDENTIFY.</span>
                    <span className="login-footer-version">
                        IDFOUNDRY
                    </span>
                </div>
            </section>

            {/* Right login panel */}
            <section className="login-form-panel">
                <div className="login-form-inner">
                    <div className="login-mobile-brand">
                        <span className="login-brand-icon">
                            <Fingerprint size={25} />
                        </span>
                        <span className="login-brand-name">
                            IDFoundry
                        </span>
                    </div>

                    <div className="login-form-heading">
                        <span className="login-welcome-label">
                            WELCOME BACK
                        </span>

                        <h2>Sign in to your workspace</h2>

                        <p>
                            Enter your account details to continue.
                        </p>
                    </div>

                    <form
                        className="login-form"
                        onSubmit={handleLogin}
                    >
                        <div className="login-field">
                            <label htmlFor="login-email">
                                Email address
                            </label>

                            <input
                                id="login-email"
                                type="email"
                                autoComplete="username"
                                placeholder="you@organization.com"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="login-field">
                            <div className="login-password-label">
                                <label htmlFor="login-password">
                                    Password
                                </label>
                            </div>

                            <div className="login-password-wrap">
                                <input
                                    id="login-password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    autoComplete="current-password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                    required
                                    disabled={loading}
                                />

                                <button
                                    type="button"
                                    className="login-password-toggle"
                                    onClick={() =>
                                        setShowPassword((current) => !current)
                                    }
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                    aria-pressed={showPassword}
                                    disabled={loading}
                                >
                                    {showPassword
                                        ? <EyeOff size={19} />
                                        : <Eye size={19} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div
                                className="login-error"
                                role="alert"
                            >
                                <ShieldCheck size={18} />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            className="login-submit"
                            type="submit"
                            disabled={loading}
                        >
                            <span>
                                {loading
                                    ? "Signing you in..."
                                    : "Sign in to IDFoundry"}
                            </span>

                            {!loading && <ArrowRight size={19} />}
                        </button>
                    </form>

                    <div className="login-security-note">
                        <ShieldCheck size={18} />

                        <div>
                            <strong>Secure sign-in</strong>
                            <span>
                                Your account is verified by IDFoundry.
                            </span>
                        </div>
                    </div>

                    <p className="login-form-footer">
                        IDFoundry · Create. Verify. Identify.
                    </p>
                </div>
            </section>
        </main>
    );
}

export default Login;