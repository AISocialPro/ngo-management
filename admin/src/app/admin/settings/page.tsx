'use client';

import { useMemo, useState } from 'react';

/* utils */
const cx = (...a: Array<string | false | null | undefined>) => a.filter(Boolean).join(' ');

/* tabs */
type Tab =
  | 'general'
  | 'branding'
  | 'appearance'
  | 'domain'
  | 'login'
  | 'users'
  | 'notifications'
  | 'integrations'
  | 'api'
  | 'privacy'
  | 'billing'
  | 'backup'
  | 'audit'
  | 'advanced';

const TABS: { key: Tab; label: string }[] = [
  { key: 'general', label: 'General' },
  { key: 'branding', label: 'Branding' },
  { key: 'appearance', label: 'Appearance' },
  { key: 'domain', label: 'Custom Domain & Email' },
  { key: 'login', label: 'Login & Pages' },
  { key: 'users', label: 'Users & Permissions' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'integrations', label: 'SSO & SMTP' },
  { key: 'api', label: 'API & Webhooks' },
  { key: 'privacy', label: 'Privacy & Legal' },
  { key: 'billing', label: 'Billing' },
  { key: 'backup', label: 'Backup & Export' },
  { key: 'audit', label: 'Audit Logs' },
  { key: 'advanced', label: 'Advanced' },
];

/* page */
export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('general');

  const [primary, setPrimary] = useState('#3498db');
  const [secondary, setSecondary] = useState('#2ecc71');
  const [theme, setTheme] = useState('Default');

  const [logoLight, setLogoLight] = useState<string | null>(null);
  const [logoDark, setLogoDark] = useState<string | null>(null);
  const [favicon, setFavicon] = useState<string | null>(null);

  const themeCards = useMemo(
    () => [
      { name: 'Default', a: '#3498db', b: '#2ecc71' },
      { name: 'Purple–Orange', a: '#9b59b6', b: '#e67e22' },
      { name: 'Red–Orange', a: '#e74c3c', b: '#f39c12' },
      { name: 'Dark', a: '#34495e', b: '#7f8c8d' },
    ],
    []
  );

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings & White-Label</h1>
          <p className="text-sm text-slate-500">Branding, domain, SSO, API, backups and more.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => alert('Saved (demo)')}
            className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
          >
            Save
          </button>
          <button
            onClick={() => alert('Cancelled (demo)')}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </div>

      <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="flex gap-1 overflow-x-auto border-b border-slate-200 p-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cx(
                'whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium',
                tab === t.key ? 'bg-sky-50 text-sky-700 ring-1 ring-sky-200' : 'text-slate-600 hover:bg-slate-50'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === 'general' && <GeneralSection />}
          {tab === 'branding' && (
            <BrandingSection
              primary={primary}
              secondary={secondary}
              setPrimary={setPrimary}
              setSecondary={setSecondary}
              theme={theme}
              setTheme={setTheme}
              themeCards={themeCards}
              logoLight={logoLight}
              logoDark={logoDark}
              favicon={favicon}
              setLogoLight={setLogoLight}
              setLogoDark={setLogoDark}
              setFavicon={setFavicon}
            />
          )}
          {tab === 'appearance' && <AppearanceSection />}
          {tab === 'domain' && <DomainEmailSection />}
          {tab === 'login' && <LoginPagesSection />}
          {tab === 'users' && <UsersSection />}
          {tab === 'notifications' && <NotificationsSection />}
          {tab === 'integrations' && <IntegrationsSection />}
          {tab === 'api' && <ApiWebhooksSection />}
          {tab === 'privacy' && <PrivacySection />}
          {tab === 'billing' && <BillingSection />}
          {tab === 'backup' && <BackupSection />}
          {tab === 'audit' && <AuditSection />}
          {tab === 'advanced' && <AdvancedSection />}
        </div>
      </div>
    </div>
  );
}

/* ---------- small building blocks ---------- */

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={cx('rounded-lg border border-slate-200 bg-white p-4 shadow-sm', className)}>{children}</div>;
}
function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">{children}</div>;
}
function Toggle({ title, desc, defaultChecked }: { title: string; desc?: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 py-3 last:border-0">
      <div>
        <div className="font-medium text-slate-800">{title}</div>
        {desc && <div className="text-sm text-slate-500">{desc}</div>}
      </div>
      <label className="relative inline-flex cursor-pointer items-center">
        <input type="checkbox" defaultChecked={defaultChecked} className="peer sr-only" />
        <div className="h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-sky-600" />
        <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />
      </label>
    </div>
  );
}

function Field(props: {
  label: string;
  as?: 'textarea' | 'file';
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
}) {
  const { label, as, type = 'text', placeholder, defaultValue, onChange } = props;
  return (
    <label className="block text-sm">
      <div className="mb-1 font-medium text-slate-700">{label}</div>
      {as === 'textarea' ? (
        <textarea
          className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
          rows={4}
          defaultValue={defaultValue}
          placeholder={placeholder}
          onChange={onChange as any}
        />
      ) : as === 'file' ? (
        <input
          type="file"
          className="w-full rounded-md border border-slate-300 px-3 py-2 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2"
          onChange={onChange as any}
        />
      ) : (
        <input
          type={type}
          className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
          defaultValue={defaultValue}
          placeholder={placeholder}
          onChange={onChange as any}
        />
      )}
    </label>
  );
}

function Select({ label, options, defaultValue }: { label: string; options: string[]; defaultValue?: string }) {
  return (
    <label className="block text-sm">
      <div className="mb-1 font-medium text-slate-700">{label}</div>
      <select
        defaultValue={defaultValue}
        className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const presets = ['#3498db', '#9b59b6', '#e74c3c', '#34495e', '#2ecc71', '#e67e22', '#f39c12', '#7f8c8d'];
  return (
    <div>
      <div className="mb-1 text-sm font-medium text-slate-700">{label}</div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 cursor-pointer rounded border border-slate-300 bg-transparent"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-36 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
        />
        <div className="ml-2 flex flex-wrap gap-1">
          {presets.map((c) => (
            <button
              key={c}
              onClick={() => onChange(c)}
              className="h-7 w-7 rounded-full ring-1 ring-slate-300"
              style={{ background: c }}
              aria-label={c}
              title={c}
              type="button"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- sections ---------- */

function GeneralSection() {
  return (
    <div className="space-y-5">
      <Row>
        <Card>
          <h3 className="mb-3 text-lg font-semibold text-slate-900">Organization</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Organization Name" defaultValue="NGO Connect" />
            <Field label="Support Email" defaultValue="support@ngoconnect.org" />
            <Field label="Phone" defaultValue="+1 (555) 123-4567" />
            <Field label="Website" defaultValue="https://www.ngoconnect.org" />
            <div className="md:col-span-2">
              <Field label="Address" as="textarea" defaultValue="123 Main Street, City, Country" />
            </div>
          </div>
        </Card>
        <Card>
          <h3 className="mb-3 text-lg font-semibold text-slate-900">Locale</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Select label="Language" options={['English (US)', 'English (UK)', 'French', 'Spanish', 'Hindi']} />
            <Select
              label="Timezone"
              options={['(UTC-05:00) Eastern', '(UTC-06:00) Central', '(UTC-07:00) Mountain', '(UTC-08:00) Pacific']}
            />
            <Select label="Date Format" options={['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']} />
            <Select label="Currency" options={['USD ($)', 'EUR (€)', 'GBP (£)', 'INR (₹)']} />
          </div>
          <div className="mt-4">
            <Toggle title='Hide "Powered by"' desc="Remove vendor attribution in client experiences." defaultChecked />
          </div>
        </Card>
      </Row>
    </div>
  );
}

function BrandingSection(props: {
  primary: string;
  secondary: string;
  setPrimary: (v: string) => void;
  setSecondary: (v: string) => void;
  theme: string;
  setTheme: (v: string) => void;
  themeCards: { name: string; a: string; b: string }[];
  logoLight: string | null;
  logoDark: string | null;
  favicon: string | null;
  setLogoLight: (s: string | null) => void;
  setLogoDark: (s: string | null) => void;
  setFavicon: (s: string | null) => void;
}) {
  const {
    primary,
    secondary,
    setPrimary,
    setSecondary,
    theme,
    setTheme,
    themeCards,
    logoLight,
    logoDark,
    favicon,
    setLogoLight,
    setLogoDark,
    setFavicon,
  } = props;

  const onPick = (e: React.ChangeEvent<HTMLInputElement>, setter: (s: string | null) => void) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setter(URL.createObjectURL(f));
  };

  return (
    <div className="space-y-5">
      <Row>
        <Card>
          <h3 className="mb-3 text-lg font-semibold text-slate-900">Logos & Favicon</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <Field label="Logo (Light BG)" as="file" onChange={(e) => onPick(e as any, setLogoLight)} />
              {logoLight && <img src={logoLight} className="mt-2 max-h-16 rounded bg-slate-50 p-2" />}
            </div>
            <div>
              <Field label="Logo (Dark BG)" as="file" onChange={(e) => onPick(e as any, setLogoDark)} />
              {logoDark && <img src={logoDark} className="mt-2 max-h-16 rounded bg-slate-800 p-2" />}
            </div>
            <div>
              <Field label="Favicon" as="file" onChange={(e) => onPick(e as any, setFavicon)} />
              {favicon && <img src={favicon} className="mt-2 h-8 w-8 rounded" />}
            </div>
          </div>
        </Card>
        <Card>
          <h3 className="mb-3 text-lg font-semibold text-slate-900">Brand Colors</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ColorField label="Primary" value={primary} onChange={setPrimary} />
            <ColorField label="Secondary" value={secondary} onChange={setSecondary} />
          </div>
        </Card>
      </Row>

      <Card>
        <h3 className="mb-3 text-lg font-semibold text-slate-900">Theme</h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {themeCards.map((c) => (
            <button
              key={c.name}
              onClick={() => setTheme(c.name)}
              className={cx(
                'rounded-lg border p-2 text-left hover:bg-slate-50',
                theme === c.name ? 'border-sky-400 ring-2 ring-sky-200' : 'border-slate-200'
              )}
              type="button"
            >
              <div className="mb-2 flex h-12 overflow-hidden rounded">
                <div className="h-full w-3/4" style={{ background: c.a }} />
                <div className="h-full w-1/4" style={{ background: c.b }} />
              </div>
              <div className="text-sm">{c.name}</div>
            </button>
          ))}
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <button
          onClick={() => alert('Branding reset (demo)')}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Reset
        </button>
        <button
          onClick={() => alert(`Saved theme ${theme} (demo)`)}
          className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
        >
          Save Branding
        </button>
      </div>
    </div>
  );
}

function AppearanceSection() {
  return (
    <div className="space-y-5">
      <Card>
        <h3 className="mb-2 text-lg font-semibold text-slate-900">Layout</h3>
        <Toggle title="Fixed Header" desc="Keep header stuck to the top." defaultChecked />
        <Toggle title="Collapsible Sidebar" desc="Allow users to collapse the sidebar." defaultChecked />
        <Toggle title="Show Breadcrumbs" desc="Display breadcrumbs under the topbar." />
      </Card>
      <div className="flex justify-end">
        <button
          onClick={() => alert('Appearance applied (demo)')}
          className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
        >
          Apply
        </button>
      </div>
    </div>
  );
}

function DomainEmailSection() {
  return (
    <div className="space-y-5">
      <Row>
        <Card>
          <h3 className="mb-3 text-lg font-semibold text-slate-900">Custom Domain</h3>
          <Field label="Primary Domain" defaultValue="portal.ngoconnect.org" />
          <p className="mt-2 text-sm text-slate-500">
            Point a CNAME to <b>your-subdomain.vendor.com</b>. DNS may take time to propagate.
          </p>
          <button
            onClick={() => alert('Re-checking DNS (demo)')}
            className="mt-3 rounded-md border border-sky-600 px-3 py-2 text-sm text-sky-700 hover:bg-sky-50"
          >
            <i className="fa-solid fa-rotate mr-2" /> Re-check DNS
          </button>
        </Card>

        <Card>
          <h3 className="mb-3 text-lg font-semibold text-slate-900">SMTP (Branded Email)</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Host" defaultValue="smtp.sendgrid.net" />
            <Field label="Port" defaultValue="587" />
            <Select label="Encryption" options={['TLS', 'SSL', 'None']} />
            <Field label="Username" defaultValue="apikey" />
            <Field label="Password" type="password" defaultValue="••••••••" />
          </div>
          <button
            onClick={() => alert('Test email sent (demo)')}
            className="mt-3 rounded-md border border-sky-600 px-3 py-2 text-sm text-sky-700 hover:bg-sky-50"
          >
            <i className="fa-solid fa-paper-plane mr-2" />
            Send Test Email
          </button>
        </Card>
      </Row>

      <Card>
        <h3 className="mb-3 text-lg font-semibold text-slate-900">Email Template</h3>
        <Field label="Subject" defaultValue="[{{app_name}}] Welcome to your portal" />
        <Field label="HTML Body" as="textarea" defaultValue="<h1>Welcome {{first_name}}!</h1>Thanks for joining {{app_name}}." />
        <div className="mt-3 text-sm text-slate-500">
          Variables: <code>{'{{app_name}}'}</code>, <code>{'{{first_name}}'}</code>, <code>{'{{verify_link}}'}</code>
        </div>
        <div className="mt-3">
          <button
            onClick={() => alert('Template saved (demo)')}
            className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
          >
            Save Template
          </button>
        </div>
      </Card>
    </div>
  );
}

function LoginPagesSection() {
  return (
    <div className="space-y-5">
      <Card>
        <h3 className="mb-3 text-lg font-semibold text-slate-900">Login Page</h3>
        <Toggle title="Show Organization Banner" defaultChecked />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="Headline" defaultValue="Welcome to NGO Connect" />
          <Field label="Subheading" defaultValue="Manage your programs in one place." />
        </div>
        <Field label="Custom CSS" as="textarea" defaultValue="/* CSS overrides */" />
        <Field label="Custom JS (Footer)" as="textarea" defaultValue="// analytics('init')" />
      </Card>

      <Row>
        <Card>
          <h3 className="mb-2 text-lg font-semibold text-slate-900">Cookie Banner</h3>
          <Toggle title="Enable Cookie Banner" defaultChecked />
          <Field label="Banner Text" defaultValue="We use cookies to improve your experience." />
        </Card>
        <Card>
          <h3 className="mb-2 text-lg font-semibold text-slate-900">Analytics</h3>
          <Field label="Tracking ID" placeholder="G-XXXXXX" />
          <Toggle title="Anonymize IP" defaultChecked />
        </Card>
      </Row>

      <div className="flex justify-end">
        <button
          onClick={() => alert('Login/pages saved (demo)')}
          className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
        >
          Save
        </button>
      </div>
    </div>
  );
}

function UsersSection() {
  return (
    <div className="space-y-5">
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">User Management</h3>
          <button
            onClick={() => alert('Open add-user modal (demo)')}
            className="rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700"
          >
            <i className="fa fa-plus mr-2" />
            Add New User
          </button>
        </div>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left">User</th>
              <th className="py-2 text-left">Email</th>
              <th className="py-2 text-left">Role</th>
              <th className="py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="[&>tr:nth-child(even)]:bg-slate-50">
            {[
              { n: 'Michael Chen', e: 'michael@ngoconnect.org', r: 'Manager', a: 'https://randomuser.me/api/portraits/men/32.jpg' },
              { n: 'Priya Sharma', e: 'priya@ngoconnect.org', r: 'Coordinator', a: 'https://randomuser.me/api/portraits/women/68.jpg' },
              { n: 'David Wilson', e: 'david@ngoconnect.org', r: 'Viewer', a: 'https://randomuser.me/api/portraits/men/75.jpg' },
            ].map((u) => (
              <tr key={u.e} className="border-b last:border-0">
                <td className="py-2">
                  <div className="flex items-center gap-2">
                    <img src={u.a} className="h-8 w-8 rounded-full object-cover" />
                    <span>{u.n}</span>
                  </div>
                </td>
                <td className="py-2">{u.e}</td>
                <td className="py-2">{u.r}</td>
                <td className="py-2">
                  <div className="flex gap-2">
                    <button className="rounded-md border border-slate-300 px-2 py-1 hover:bg-slate-50">Edit</button>
                    <button className="rounded-md bg-rose-500 px-2 py-1 text-white hover:bg-rose-600">Remove</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Row>
        <Card>
          <h3 className="mb-2 text-lg font-semibold text-slate-900">Roles</h3>
          <ul className="space-y-1 text-sm text-slate-700">
            <li><b>Administrator</b> — full access.</li>
            <li><b>Manager</b> — manage events, volunteers, donations.</li>
            <li><b>Coordinator</b> — events/volunteers only.</li>
            <li><b>Viewer</b> — read-only.</li>
          </ul>
        </Card>
        <Card>
          <h3 className="mb-2 text-lg font-semibold text-slate-900">Password Policy</h3>
          <Toggle title="Require MFA" defaultChecked />
          <Toggle title="Expire passwords (90 days)" />
        </Card>
      </Row>
    </div>
  );
}

function NotificationsSection() {
  return (
    <div className="space-y-5">
      <Row>
        <Card>
          <h3 className="mb-2 text-lg font-semibold text-slate-900">Email Notifications</h3>
          <Toggle title="Event Reminders" defaultChecked />
          <Toggle title="Donation Receipts" defaultChecked />
          <Toggle title="Volunteer Applications" defaultChecked />
          <Toggle title="Monthly Reports" />
        </Card>
        <Card>
          <h3 className="mb-2 text-lg font-semibold text-slate-900">In-App Notifications</h3>
          <Toggle title="New Donations" defaultChecked />
          <Toggle title="Event Updates" defaultChecked />
          <Toggle title="System Updates" />
        </Card>
      </Row>
      <div className="flex justify-end">
        <button
          onClick={() => alert('Preferences saved (demo)')}
          className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
        >
          Save
        </button>
      </div>
    </div>
  );
}

function IntegrationsSection() {
  return (
    <div className="space-y-5">
      <Row>
        <Card>
          <h3 className="mb-3 text-lg font-semibold text-slate-900">Single Sign-On (SSO)</h3>
          <Select label="Provider" options={['SAML 2.0', 'OpenID Connect', 'Okta', 'Azure AD']} />
          <Field label="Metadata URL / JSON" as="textarea" placeholder="Paste IdP metadata here" />
          <Toggle title="Force SSO" desc="Require users to authenticate via SSO." />
          <button
            onClick={() => alert('SSO configuration tested (demo)')}
            className="mt-3 rounded-md border border-sky-600 px-3 py-2 text-sm text-sky-700 hover:bg-sky-50"
          >
            Test SSO
          </button>
        </Card>
        <Card>
          <h3 className="mb-3 text-lg font-semibold text-slate-900">SMTP (Quick)</h3>
          <Field label="From Name" defaultValue="NGO Connect" />
          <Field label="From Email" defaultValue="no-reply@ngoconnect.org" />
          <button
            onClick={() => alert('SMTP saved (demo)')}
            className="mt-3 rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
          >
            Save SMTP
          </button>
        </Card>
      </Row>
    </div>
  );
}

function ApiWebhooksSection() {
  return (
    <div className="space-y-5">
      <Card>
        <h3 className="mb-3 text-lg font-semibold text-slate-900">API Keys</h3>
        <div className="flex items-center gap-2">
          <code className="max-w-full flex-1 overflow-auto rounded border border-slate-200 bg-slate-50 px-2 py-1">
            sk_live_3c2d…f91
          </code>
          <button
            onClick={() => {
              navigator.clipboard.writeText('sk_live_3c2d…f91');
              alert('Copied (demo)');
            }}
            className="rounded-md border border-sky-600 px-3 py-1.5 text-sm text-sky-700 hover:bg-sky-50"
          >
            Copy
          </button>
        </div>
        <button
          onClick={() => alert('New key generated (demo)')}
          className="mt-3 rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700"
        >
          <i className="fa fa-plus mr-2" />
          Generate New Key
        </button>
      </Card>

      <Card>
        <h3 className="mb-3 text-lg font-semibold text-slate-900">Webhooks</h3>
        <Field label="Endpoint URL" placeholder="https://example.org/webhooks/ngo" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Select label="Events" options={['donation.created', 'donation.refunded', 'volunteer.approved', 'event.updated']} />
          <Select label="Secret Version" options={['v1', 'v2']} />
        </div>
        <button
          onClick={() => alert('Webhook saved (demo)')}
          className="mt-3 rounded-md border border-sky-600 px-3 py-2 text-sm text-sky-700 hover:bg-sky-50"
        >
          Save Webhook
        </button>
      </Card>
    </div>
  );
}

function PrivacySection() {
  return (
    <div className="space-y-5">
      <Row>
        <Card>
          <h3 className="mb-2 text-lg font-semibold text-slate-900">Policies</h3>
          <Field label="Privacy Policy URL" defaultValue="/legal/privacy" />
          <Field label="Terms of Service URL" defaultValue="/legal/terms" />
          <Toggle title="Require Policy Consent" defaultChecked />
        </Card>
        <Card>
          <h3 className="mb-2 text-lg font-semibold text-slate-900">Data Controls</h3>
          <button
            onClick={() => alert('DSAR export queued (demo)')}
            className="mr-2 rounded-md border border-sky-600 px-3 py-2 text-sm text-sky-700 hover:bg-sky-50"
          >
            Export user data (DSAR)
          </button>
          <button
            onClick={() => alert('Account erasure requested (demo)')}
            className="rounded-md bg-rose-500 px-3 py-2 text-sm text-white hover:bg-rose-600"
          >
            Request account erasure
          </button>
        </Card>
      </Row>
    </div>
  );
}

function BillingSection() {
  return (
    <div className="space-y-5">
      <Row>
        <Card>
          <h3 className="mb-2 text-lg font-semibold text-slate-900">Plan</h3>
          <p>
            <b>Professional</b> — $99/mo
          </p>
          <ul className="mt-2 list-disc pl-5 text-sm text-slate-600">
            <li>White-label branding</li>
            <li>SSO & API</li>
            <li>Priority support</li>
          </ul>
          <button
            onClick={() => alert('Change plan (demo)')}
            className="mt-3 rounded-md border border-sky-600 px-3 py-2 text-sm text-sky-700 hover:bg-sky-50"
          >
            Change Plan
          </button>
        </Card>
        <Card>
          <h3 className="mb-2 text-lg font-semibold text-slate-900">Billing Details</h3>
          <Field label="Card" defaultValue="Visa •••• 4242" />
          <Field label="Invoices Email" defaultValue="billing@ngoconnect.org" />
          <button
            onClick={() => alert('Billing saved (demo)')}
            className="mt-3 rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
          >
            Save Billing
          </button>
        </Card>
      </Row>

      <Card>
        <h3 className="mb-2 text-lg font-semibold text-slate-900">Invoice History</h3>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left">Date</th>
              <th className="py-2 text-left">Invoice #</th>
              <th className="py-2 text-left">Amount</th>
              <th className="py-2 text-left">Status</th>
            </tr>
          </thead>
        <tbody className="[&>tr:nth-child(even)]:bg-slate-50">
            <tr className="border-b">
              <td className="py-2">Jan 01, 2023</td>
              <td className="py-2">INV-2023-001</td>
              <td className="py-2">$99.00</td>
              <td className="py-2">
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">Paid</span>
              </td>
            </tr>
            <tr>
              <td className="py-2">Dec 01, 2022</td>
              <td className="py-2">INV-2022-012</td>
              <td className="py-2">$99.00</td>
              <td className="py-2">
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">Paid</span>
              </td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function BackupSection() {
  return (
    <div className="space-y-5">
      <Row>
        <Card>
          <h3 className="mb-3 text-lg font-semibold text-slate-900">Automatic Backups</h3>
          <Toggle title="Enable Automatic Backups" defaultChecked />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Select label="Frequency" options={['Daily', 'Weekly', 'Monthly']} defaultValue="Weekly" />
            <Select label="Retention" options={['7 days', '30 days', '90 days', '1 year']} defaultValue="30 days" />
          </div>
        </Card>
        <Card>
          <h3 className="mb-3 text-lg font-semibold text-slate-900">Manual</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => alert('Backup started (demo)')}
              className="rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700"
            >
              <i className="fa fa-download mr-2" />
              Create Backup Now
            </button>
            <button
              onClick={() => alert('Downloading latest backup (demo)')}
              className="rounded-md bg-slate-700 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              <i className="fa fa-cloud-arrow-down mr-2" />
              Download Latest Backup
            </button>
          </div>
        </Card>
      </Row>

      <Card>
        <h3 className="mb-3 text-lg font-semibold text-slate-900">Restore</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Field label="Backup File" as="file" />
          <div className="md:col-span-2 flex items-end">
            <button
              onClick={() => alert('Restore initiated (demo)')}
              className="rounded-md bg-rose-500 px-3 py-2 text-sm font-medium text-white hover:bg-rose-600"
            >
              <i className="fa fa-upload mr-2" />
              Restore
            </button>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="mb-3 text-lg font-semibold text-slate-900">Export Data</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Select label="Format" options={['CSV', 'JSON', 'XLSX']} />
          <div className="md:col-span-2 flex items-end">
            <button
              onClick={() => alert('Export queued (demo)')}
              className="rounded-md border border-sky-600 px-3 py-2 text-sm text-sky-700 hover:bg-sky-50"
            >
              Export
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function AuditSection() {
  return (
    <Card>
      <h3 className="mb-3 text-lg font-semibold text-slate-900">Recent Activity</h3>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2 text-left">Time</th>
            <th className="py-2 text-left">User</th>
            <th className="py-2 text-left">Action</th>
            <th className="py-2 text-left">IP</th>
          </tr>
        </thead>
        <tbody className="[&>tr:nth-child(even)]:bg-slate-50">
          <tr className="border-b">
            <td className="py-2">2023-01-15 10:04</td>
            <td className="py-2">Sarah Johnson</td>
            <td className="py-2">Updated Branding</td>
            <td className="py-2">192.168.1.12</td>
          </tr>
          <tr className="border-b">
            <td className="py-2">2023-01-14 18:29</td>
            <td className="py-2">Michael Chen</td>
            <td className="py-2">Created API Key</td>
            <td className="py-2">192.168.1.45</td>
          </tr>
          <tr>
            <td className="py-2">2023-01-14 12:18</td>
            <td className="py-2">Priya Sharma</td>
            <td className="py-2">Edited Email Template</td>
            <td className="py-2">10.1.0.3</td>
          </tr>
        </tbody>
      </table>
    </Card>
  );
}

function AdvancedSection() {
  return (
    <div className="space-y-5">
      <Card>
        <h3 className="mb-2 text-lg font-semibold text-slate-900">Feature Flags</h3>
        <Toggle title="Enable Beta Reports" />
        <Toggle title="Experimental UI" />
      </Card>
      <Card>
        <h3 className="mb-2 text-lg font-semibold text-slate-900">Danger Zone</h3>
        <button
          onClick={() => confirm('Reset tenant branding & domain?') && alert('Tenant reset (demo)')}
          className="rounded-md bg-rose-500 px-3 py-2 text-sm font-medium text-white hover:bg-rose-600"
        >
          Reset Tenant Branding
        </button>
      </Card>
    </div>
  );
}
