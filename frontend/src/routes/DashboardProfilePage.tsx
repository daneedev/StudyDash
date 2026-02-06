import { useEffect, useState } from "react";
import { useNavigate, useRouteContext, useRouter } from "@tanstack/react-router";
import { BannerStats } from "../components/Banner-stats-new";
import { Eye, EyeOff } from "lucide-react";
import { setAuthToken } from "./rootRoute";

export function DashboardProfilePage() {
  const { userData } = useRouteContext({ from: "/dashboard" });
  const [username, setUsername] = useState("");
  const [originalUsername, setOriginalUsername] = useState("");
  const [passwordCurrent, setPasswordCurrent] = useState("");
  const [passwordNew, setPasswordNew] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [emailNew, setEmailNew] = useState("");
  const [emailPasswordCurrent, setEmailPasswordCurrent] = useState("");
  const [usernamePasswordCurrent, setUsernamePasswordCurrent] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [applyMessage, setApplyMessage] = useState("");
  const [applyMessageType, setApplyMessageType] = useState<"error" | "success" | "">("");
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteMessageType, setDeleteMessageType] = useState<"error" | "success" | "">("");
  const [isApplying, setIsApplying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState({
    passwordCurrent: false,
    passwordNew: false,
    passwordConfirm: false,
    emailPasswordCurrent: false,
    usernamePasswordCurrent: false,
    deletePassword: false,
  });
  type InvalidFieldsState = {
    passwordCurrent: boolean;
    passwordNew: boolean;
    passwordConfirm: boolean;
    emailNew: boolean;
    username: boolean;
    emailPasswordCurrent: boolean;
    usernamePasswordCurrent: boolean;
    deletePassword: boolean;
  };
  const createEmptyInvalidFields = (): InvalidFieldsState => ({
    passwordCurrent: false,
    passwordNew: false,
    passwordConfirm: false,
    emailNew: false,
    username: false,
    emailPasswordCurrent: false,
    usernamePasswordCurrent: false,
    deletePassword: false,
  });
  const [invalidFields, setInvalidFields] = useState<InvalidFieldsState>(createEmptyInvalidFields());
  const navigate = useNavigate({ from: "/dashboard/profile" });
  const router = useRouter();

  const isBlank = (value: string) => value.trim().length === 0;

  useEffect(() => {
    setUsername(userData?.username ?? "");
    setOriginalUsername(userData?.username ?? "");
  }, [userData]);

  const resetInvalidField = (field: keyof typeof invalidFields) => {
    setInvalidFields((prev) => ({ ...prev, [field]: false }));
  };

  const setApplyStatus = (message: string, type: "error" | "success") => {
    setApplyMessage(message);
    setApplyMessageType(type);
  };

  const setDeleteStatus = (message: string, type: "error" | "success") => {
    setDeleteMessage(message);
    setDeleteMessageType(type);
  };

  const togglePasswordVisibility = (field: keyof typeof passwordVisibility) => {
    setPasswordVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleApplyChanges = async () => {
    if (isApplying) {
      return;
    }
    setApplyMessage("");
    setApplyMessageType("");
    const nextInvalid = createEmptyInvalidFields();

    const payload: Record<string, string> = {};
    const passwordChangeRequested = !isBlank(passwordNew) || !isBlank(passwordConfirm);
    let passwordMismatch = false;
    const emailTouched = !isBlank(emailPasswordCurrent) || !isBlank(emailNew);
    const usernameTrimmed = username.trim();

    if (passwordChangeRequested) {
      if (isBlank(passwordCurrent)) {
        nextInvalid.passwordCurrent = true;
      }
      if (isBlank(passwordNew)) {
        nextInvalid.passwordNew = true;
      }
      if (isBlank(passwordConfirm)) {
        nextInvalid.passwordConfirm = true;
      }
      if (passwordNew && passwordConfirm && passwordNew !== passwordConfirm) {
        passwordMismatch = true;
        nextInvalid.passwordNew = true;
        nextInvalid.passwordConfirm = true;
      }
      if (!nextInvalid.passwordCurrent && !nextInvalid.passwordNew && !nextInvalid.passwordConfirm) {
        payload.currentPassword = passwordCurrent.trim();
        payload.newPassword = passwordNew.trim();
      }
    }

    if (emailTouched) {
      if (isBlank(emailPasswordCurrent)) {
        nextInvalid.emailPasswordCurrent = true;
      }
      if (isBlank(emailNew)) {
        nextInvalid.emailNew = true;
      }
      if (!nextInvalid.emailPasswordCurrent && !nextInvalid.emailNew) {
        payload.currentPassword = emailPasswordCurrent.trim();
        payload.email = emailNew.trim();
      }
    }

    if (!usernameTrimmed) {
      if (username !== originalUsername) {
        nextInvalid.username = true;
      }
    } else if (usernameTrimmed !== originalUsername) {
      if (isBlank(usernamePasswordCurrent)) {
        nextInvalid.usernamePasswordCurrent = true;
      } else {
        payload.currentPassword = usernamePasswordCurrent.trim();
        payload.username = usernameTrimmed;
      }
    }

    setInvalidFields(nextInvalid);

    if (Object.values(nextInvalid).some(Boolean)) {
      if (passwordMismatch) {
        setApplyStatus("Hesla musí být stejná.", "error");
        return;
      }
      setApplyStatus("Doplň chybějící pole.", "error");
      return;
    }

    if (Object.keys(payload).length === 0) {
      setApplyStatus("Zadej alespoň jednu změnu.", "error");
      return;
    }

    const token = localStorage.getItem("auth_token");
    if (!token) {
      setApplyStatus("Chybí přihlašovací token.", "error");
      return;
    }

    setIsApplying(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Nepodařilo se uložit změny");
      }
      let refreshedUser: { username?: string; email?: string } | null = null;
      const refreshResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        refreshedUser = refreshData?.data;
        if (refreshedUser?.username) {
          setUsername(refreshedUser.username);
          setOriginalUsername(refreshedUser.username);
        } else if (payload.username) {
          setUsername(payload.username);
          setOriginalUsername(payload.username);
        }
        if (refreshedUser) {
          localStorage.setItem("user_profile", JSON.stringify(refreshedUser));
          window.dispatchEvent(new CustomEvent("user-profile-updated", { detail: refreshedUser }));
        }
      } else if (payload.username) {
        setUsername(payload.username);
        setOriginalUsername(payload.username);
        const fallbackProfile = { username: payload.username };
        localStorage.setItem("user_profile", JSON.stringify(fallbackProfile));
        window.dispatchEvent(new CustomEvent("user-profile-updated", { detail: fallbackProfile }));
      }
      if (payload.email) {
        setEmailNew("");
      }
      if (payload.currentPassword && payload.newPassword) {
        setPasswordCurrent("");
        setPasswordNew("");
        setPasswordConfirm("");
      }
      if (payload.email) {
        setEmailPasswordCurrent("");
      }
      if (payload.username) {
        setUsernamePasswordCurrent("");
      }
      await router.invalidate();
      const needsRelogin = Boolean(payload.username || payload.email || payload.newPassword);
      if (needsRelogin) {
        const reloginUsername =
          payload.username ||
          refreshedUser?.username ||
          userData?.username ||
          originalUsername;
        const reloginPassword = payload.newPassword || payload.currentPassword;
        if (reloginUsername && reloginPassword) {
          const reloginResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: reloginUsername,
              password: reloginPassword,
            }),
          });
          const reloginData = await reloginResponse.json();
          if (!reloginResponse.ok) {
            throw new Error(reloginData.message || "Nepodařilo se znovu přihlásit");
          }
          await setAuthToken(reloginData.data.accessToken);
          window.location.reload();
          setApplyStatus("Změny byly uloženy.", "success");
          return;
        }
      }
      setApplyStatus("Změny byly uloženy.", "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Nepodařilo se uložit změny";
      setApplyStatus(message, "error");
    } finally {
      setIsApplying(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (isDeleting) {
      return;
    }
    setDeleteMessage("");
    setDeleteMessageType("");
    const nextInvalid = createEmptyInvalidFields();
    const deleteUsername = originalUsername.trim() || userData?.username?.trim() || username.trim();
    if (!deleteUsername) {
      nextInvalid.username = true;
    }
    if (isBlank(deletePassword)) {
      nextInvalid.deletePassword = true;
    }
    setInvalidFields(nextInvalid);
    if (Object.values(nextInvalid).some(Boolean)) {
      setDeleteStatus("Doplň chybějící pole.", "error");
      return;
    }
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setDeleteStatus("Chybí přihlašovací token.", "error");
      return;
    }
    setIsDeleting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/profile`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: deleteUsername,
          password: deletePassword.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Nepodařilo se smazat účet");
      }
      setDeleteStatus("Účet byl smazán.", "success");
      setDeletePassword("");
      await setAuthToken(null);
      await navigate({ to: "/login" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Nepodařilo se smazat účet";
      setDeleteStatus(message, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full max-w-[1160px] mx-[5%] mt-12">
      <div className="flex flex-row justify-between">
        <div className="flex flex-col text-start">
          <h1 className="text-3xl md:text-4xl font-semibold text-[var(--text-white)]">Správa profilu</h1>
          <p className="text-lg md:text-xl text-[var(--text-darkgray)] font-medium">Krásný den, dnes je {new Date().toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        
        <button
          onClick={handleApplyChanges}
          disabled={isApplying}
          className="
            border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-normal
            bg-transparent
            cursor-pointer
            rounded-xl
            max-h-[58px] md:max-h-[46px]
            px-3 md:py-2
            hover:scale-105
            transition-all duration-250 ease-in-out
          "
        >
          {isApplying ? "Ukládám..." : "Aplikovat změny"}
        </button>
      </div>
      {applyMessage && (
        <p className={`mt-4 text-sm ${applyMessageType === "success" ? "text-emerald-400" : "text-red-400"}`}>
          {applyMessage}
        </p>
      )}

      <BannerStats />

      <section className="max-w-[790px] mx-auto mt-16">
        <div className="flex flex-col md:flex-row justify-between mb-20">
          <div>
            <p className="flex items-center gap-2">
              <span className="h-6 w-[3px] bg-[var(--color-primary)] inline-block"></span>
              <span className="text-lg font-semibold text-[var(--text-semiwhite)]">Změna hesla</span>
            </p>
            <p className="max-w-[250px] text-sm text-[var(--text-darkgray)] mt-1">Pro větší bezpečí doporučujeme heslo měnit pravidelně.</p>
          </div>

          <div className="pt-2 md:pt-0">
            <div className="flex flex-row items-center gap-4 mb-2">
              <img src="/web_images/Lock_Password.svg" alt="lock" />
              <div className="relative max-w-[340px] w-lvh">
                <input 
                  type={passwordVisibility.passwordCurrent ? "text" : "password"} 
                  name="aktualnipass" 
                  id="pass1" 
                  value={passwordCurrent}
                  onChange={(event) => {
                    setPasswordCurrent(event.target.value);
                    resetInvalidField("passwordCurrent");
                  }}
                  className={`border-2 ${invalidFields.passwordCurrent ? "border-red-500 focus:border-red-500" : "border-[var(--border-card)] focus:border-[var(--color-primary)]"} rounded-xl text-md p-1 pl-3 pr-10 text-[var(--text-semiwhite)] w-full focus:outline-none transition-all`} 
                  placeholder="Aktuální heslo"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("passwordCurrent")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-darkgray)] hover:text-[var(--text-semiwhite)] transition-colors"
                  aria-label={passwordVisibility.passwordCurrent ? "Skrýt heslo" : "Zobrazit heslo"}
                >
                  {passwordVisibility.passwordCurrent ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            <div className="flex flex-row items-center gap-4 mb-2">
              <img src="/web_images/Lock_Password.svg" alt="lock" />
              <div className="relative max-w-[340px] w-lvh">
                <input 
                  type={passwordVisibility.passwordNew ? "text" : "password"} 
                  name="novypass" 
                  autoComplete="off"
                  id="pass2" 
                  value={passwordNew}
                  onChange={(event) => {
                    setPasswordNew(event.target.value);
                    resetInvalidField("passwordNew");
                  }}
                  className={`border-2 ${invalidFields.passwordNew ? "border-red-500 focus:border-red-500" : "border-[var(--border-card)] focus:border-[var(--color-primary)]"} rounded-xl text-md p-1 pl-3 pr-10 text-[var(--text-semiwhite)] w-full focus:outline-none transition-all`} 
                  placeholder="Nové heslo"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("passwordNew")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-darkgray)] hover:text-[var(--text-semiwhite)] transition-colors"
                  aria-label={passwordVisibility.passwordNew ? "Skrýt heslo" : "Zobrazit heslo"}
                >
                  {passwordVisibility.passwordNew ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            <div className="flex flex-row items-center gap-4 mb-2">
              <img src="/web_images/Lock_Password.svg" alt="lock" />
              <div className="relative max-w-[340px] w-lvh">
                <input 
                  type={passwordVisibility.passwordConfirm ? "text" : "password"} 
                  name="novypassconfirm" 
                  autoComplete="off"
                  id="pass3" 
                  value={passwordConfirm}
                  onChange={(event) => {
                    setPasswordConfirm(event.target.value);
                    resetInvalidField("passwordConfirm");
                  }}
                  className={`border-2 ${invalidFields.passwordConfirm ? "border-red-500 focus:border-red-500" : "border-[var(--border-card)] focus:border-[var(--color-primary)]"} rounded-xl text-md p-1 pl-3 pr-10 text-[var(--text-semiwhite)] w-full focus:outline-none transition-all`} 
                  placeholder="Nové heslo znovu"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("passwordConfirm")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-darkgray)] hover:text-[var(--text-semiwhite)] transition-colors"
                  aria-label={passwordVisibility.passwordConfirm ? "Skrýt heslo" : "Zobrazit heslo"}
                >
                  {passwordVisibility.passwordConfirm ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>


        <div className="flex flex-col md:flex-row justify-between mb-20">
          <div>
            <p className="flex items-center gap-2">
              <span className="h-6 w-[3px] bg-[var(--color-primary)] inline-block"></span>
              <span className="text-lg font-semibold text-[var(--text-semiwhite)]">Změna emailu</span>
            </p>
            <p className="max-w-[250px] text-sm text-[var(--text-darkgray)] mt-1">V případě ztráty přístupu k emailu si ho zde můžete změnit.</p>
          </div>

          <div className="pt-2 md:pt-0">
            <div className="flex flex-row items-center gap-4 mb-2">
              <img src="/web_images/Lock_Password.svg" alt="lock" />
              <div className="relative max-w-[340px] w-lvh">
                <input 
                  type={passwordVisibility.emailPasswordCurrent ? "text" : "password"} 
                  name="aktualnihesloemail" 
                  id="emailpass" 
                  value={emailPasswordCurrent}
                  onChange={(event) => {
                    setEmailPasswordCurrent(event.target.value);
                    resetInvalidField("emailPasswordCurrent");
                  }}
                  className={`border-2 ${invalidFields.emailPasswordCurrent ? "border-red-500 focus:border-red-500" : "border-[var(--border-card)] focus:border-[var(--color-primary)]"} rounded-xl text-md p-1 pl-3 pr-10 text-[var(--text-semiwhite)] w-full focus:outline-none transition-all`} 
                  placeholder="Aktuální heslo"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("emailPasswordCurrent")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-darkgray)] hover:text-[var(--text-semiwhite)] transition-colors"
                  aria-label={passwordVisibility.emailPasswordCurrent ? "Skrýt heslo" : "Zobrazit heslo"}
                >
                  {passwordVisibility.emailPasswordCurrent ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            <div className="flex flex-row items-center gap-4 mb-2">
              <img src="/web_images/Mention.svg" alt="mention" />
              <input 
                type="email" 
                name="novyemail" 
                id="email2" 
                value={emailNew}
                onChange={(event) => {
                  setEmailNew(event.target.value);
                  resetInvalidField("emailNew");
                }}
                className={`border-2 ${invalidFields.emailNew ? "border-red-500 focus:border-red-500" : "border-[var(--border-card)] focus:border-[var(--color-primary)]"} rounded-xl text-md p-1 pl-3 text-[var(--text-semiwhite)] max-w-[340px] w-lvh focus:outline-none transition-all`} 
                placeholder="Nový email"
              />
            </div>

          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between mb-20">
          <div>
            <p className="flex items-center gap-2">
              <span className="h-6 w-[3px] bg-[var(--color-primary)] inline-block"></span>
              <span className="text-lg font-semibold text-[var(--text-semiwhite)]">Změna uživatelského jména</span>
            </p>
            <p className="max-w-[250px] text-sm text-[var(--text-darkgray)] mt-1">Pokud se Vám již nelíbí Vaše uživatelské jméno, máte možnost si ho zde změnit.</p>
          </div>

          <div className="pt-2 md:pt-0">
            <div className="flex flex-row items-center gap-4 mb-2">
              <img src="/web_images/Lock_Password.svg" alt="lock" />
              <div className="relative max-w-[340px] w-lvh">
                <input 
                  type={passwordVisibility.usernamePasswordCurrent ? "text" : "password"} 
                  name="aktualniheslousername" 
                  id="usernamepass" 
                  value={usernamePasswordCurrent}
                  onChange={(event) => {
                    setUsernamePasswordCurrent(event.target.value);
                    resetInvalidField("usernamePasswordCurrent");
                  }}
                  className={`border-2 ${invalidFields.usernamePasswordCurrent ? "border-red-500 focus:border-red-500" : "border-[var(--border-card)] focus:border-[var(--color-primary)]"} rounded-xl text-md p-1 pl-3 pr-10 text-[var(--text-semiwhite)] w-full focus:outline-none transition-all`} 
                  placeholder="Aktuální heslo"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("usernamePasswordCurrent")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-darkgray)] hover:text-[var(--text-semiwhite)] transition-colors"
                  aria-label={passwordVisibility.usernamePasswordCurrent ? "Skrýt heslo" : "Zobrazit heslo"}
                >
                  {passwordVisibility.usernamePasswordCurrent ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            <div className="flex flex-row items-center gap-4 mb-2">
              <img src="/web_images/Mention.svg" alt="mention" />
              <input 
                type="text" 
                name="username" 
                id="username" 
                className={`border-2 ${invalidFields.username ? "border-red-500 focus:border-red-500" : "border-[var(--border-card)] focus:border-[var(--color-primary)]"} rounded-xl text-md p-1 pl-3 text-[var(--text-semiwhite)] max-w-[340px] w-lvh focus:outline-none transition-all`} 
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value);
                  resetInvalidField("username");
                }}
              />
            </div>

          </div>
        </div>


        <div className="flex flex-col md:flex-row justify-between mb-20">
          <div>
            <p className="flex items-center gap-2">
              <span className="h-6 w-[3px] bg-[var(--color-primary)] inline-block"></span>
              <span className="text-lg font-semibold text-[var(--text-semiwhite)]">Smazání účtu</span>
            </p>
            <p className="max-w-[250px] text-sm text-[var(--text-darkgray)] mt-1">Pokud Vám již tato platforma nepřináší žádné výhody, můžete si smazat svůj učet.</p>
          </div>

          <div className="pt-2 md:pt-0 flex flex-col md:items-end">
            <div className="flex flex-row items-center gap-4 mb-2">
              <img src="/web_images/Lock_Password.svg" alt="lock" />
              <div className="relative max-w-[340px] w-lvh">
                <input 
                  type={passwordVisibility.deletePassword ? "text" : "password"} 
                  name="deletepass" 
                  id="deletepass" 
                  value={deletePassword}
                  onChange={(event) => {
                    setDeletePassword(event.target.value);
                    resetInvalidField("deletePassword");
                  }}
                  className={`border-2 ${invalidFields.deletePassword ? "border-red-500 focus:border-red-500" : "border-[var(--border-card)] focus:border-[var(--color-primary)]"} rounded-xl text-md p-1 pl-3 pr-10 text-[var(--text-semiwhite)] w-full focus:outline-none transition-all`} 
                  placeholder="Aktuální heslo"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("deletePassword")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-darkgray)] hover:text-[var(--text-semiwhite)] transition-colors"
                  aria-label={passwordVisibility.deletePassword ? "Skrýt heslo" : "Zobrazit heslo"}
                >
                  {passwordVisibility.deletePassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            <button
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="
                border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-normal
                bg-transparent
                cursor-pointer
                rounded-xl
                max-h-[58px] md:max-h-[46px]
                max-w-[380px] d:max-w-[140px]
                px-3 py-2
                hover:scale-105
                hover:border-red-900 hover:text-red-900
                transition-all duration-250 ease-in-out
              "
            >
              {isDeleting ? "Mažu účet..." : "Smazat účet"}
            </button>
            {deleteMessage && (
              <p className={`mt-3 text-sm ${deleteMessageType === "success" ? "text-emerald-400" : "text-red-400"}`}>
                {deleteMessage}
              </p>
            )}
          </div>
        </div>
        
      </section>
    </div>
    
  );
}
