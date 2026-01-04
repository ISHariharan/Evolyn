const Footer = () => {
  return (
    <footer
      className="
        mt-24
        w-full
        border-t
        border-[var(--first-color-light)]
        bg-[var(--body-color)]
        text-[var(--text-color)]
      "
    >
      <div className="mx-auto max-w-7xl px-4 py-16">
        {/* Top Grid */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-semibold text-[var(--title-color)]">
              Evolyn
            </h3>
            <p className="mt-4 max-w-xs text-sm text-[var(--text-color-light)]">
              Evolyn is a quiet system for tracking real behavior, patterns, and
              long-term progress — without noise.
            </p>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--title-color)]">
              Company
            </h4>
            <ul className="space-y-3 text-sm">
              {["About", "Features", "How it Works", "Careers"].map(item => (
                <li key={item}>
                  <a
                    href="#"
                    className="hover:text-[var(--first-color)] transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--title-color)]">
              Help
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                "Customer Support",
                "Terms & Conditions",
                "Privacy Policy",
              ].map(item => (
                <li key={item}>
                  <a
                    href="#"
                    className="hover:text-[var(--first-color)] transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--title-color)]">
              Subscribe
            </h4>

            <div className="relative mt-4">
              <input
                type="email"
                placeholder="Enter email address"
                className="
                  w-full
                  rounded-full
                  border
                  border-[var(--first-color-light)]
                  bg-[var(--container-color)]
                  px-4
                  py-3
                  text-sm
                  text-[var(--text-color)]
                  outline-none
                  focus:border-[var(--first-color)]
                "
              />
              <button
                className="
                  absolute
                  right-1
                  top-1
                  rounded-full
                  bg-[var(--button-color)]
                  px-5
                  py-2
                  text-sm
                  font-medium
                  text-[var(--button-text-color)]
                  hover:opacity-90
                "
              >
                Join
              </button>
            </div>

            <div className="mt-6 space-y-2 text-sm">
              <p>
                <span className="font-medium text-[var(--title-color)]">
                  Call:
                </span>{" "}
                (239) 555-0108
              </p>
              <p>
                <span className="font-medium text-[var(--title-color)]">
                  Email:
                </span>{" "}
                info@evolyn.app
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="
            mt-16
            flex
            flex-col
            items-center
            justify-between
            gap-6
            border-t
            border-[var(--first-color-light)]
            pt-6
            text-sm
            md:flex-row
          "
        >
          <p className="text-[var(--text-color-light)]">
            © {new Date().getFullYear()} Evolyn. All rights reserved.
          </p>

          <div className="flex gap-6">
            {["twitter", "facebook", "instagram", "github"].map(icon => (
              <a
                key={icon}
                href="#"
                className="
                  text-[var(--text-color)]
                  hover:text-[var(--first-color)]
                  transition-colors
                "
              >
                <i className={`ri-${icon}-fill text-lg`} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
