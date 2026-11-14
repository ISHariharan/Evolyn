// Shimmering "glass" placeholders shown while data loads.
// Each one is built from the same layout classes as the real component,
// so the page keeps its shape and nothing jumps when the data arrives.
import { CSSProperties, ReactNode } from "react";

type BoneProps = { w?: string | number; h?: string | number; round?: boolean; style?: CSSProperties };

/** One shimmering bar (or circle, with `round`). */
export const Bone = ({ w = "100%", h = 12, round = false, style }: BoneProps) => (
    <span
        className={`ex-bone ${round ? "ex-bone--round" : ""}`}
        style={{ width: w, height: h, ...style }}
        aria-hidden="true"
    ></span>
);

/** Wraps a skeleton so screen readers hear "Loading…" once instead of nothing. */
const Busy = ({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) => (
    <div className={className} role="status" aria-busy="true">
        <span className="sr-only">{label}</span>
        {children}
    </div>
);

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

/** Card title + subtitle placeholder. */
const CardHead = () => (
    <>
        <Bone w="40%" h={16} />
        <Bone w="65%" h={11} style={{ marginTop: 8, marginBottom: 18 }} />
    </>
);

/** Icon + label + amount + bar, like a "Where it went" row. */
const MeterRow = ({ width }: { width: string }) => (
    <div className="ex-skel__meter">
        <div className="ex-skel__row">
            <span className="ex-skel__inline">
                <Bone w={28} h={28} round />
                <Bone w={110} h={12} />
            </span>
            <Bone w={70} h={12} />
        </div>
        <Bone w={width} h={8} />
    </div>
);

export const BalancesSkeleton = () => (
    <Busy label="Loading balances…" className="ex-card ex-balances">
        <div className="ex-balances__head">
            <div style={{ flex: 1 }}>
                <Bone w={120} h={16} />
                <Bone w="55%" h={11} style={{ marginTop: 8 }} />
            </div>
            <div className="ex-balances__totals">
                {range(2).map((i) => (
                    <div key={i}>
                        <Bone w={70} h={10} />
                        <Bone w={110} h={24} style={{ marginTop: 6 }} />
                    </div>
                ))}
            </div>
        </div>
        <div className="ex-balances__grid">
            {range(3).map((i) => (
                <div key={i} className="ex-balance">
                    <span className="ex-skel__inline">
                        <Bone w={18} h={18} round />
                        <Bone w="55%" h={12} />
                    </span>
                    <Bone w="45%" h={20} style={{ marginTop: 6 }} />
                    <Bone w="75%" h={10} style={{ marginTop: 6 }} />
                </div>
            ))}
        </div>
    </Busy>
);

export const DashboardSkeleton = () => (
    <Busy label="Loading your spending…">
        <section className="ex-kpis">
            {range(4).map((i) => (
                <div key={i} className="ex-kpi">
                    <Bone w="50%" h={10} />
                    <Bone w="70%" h={22} style={{ margin: "8px 0 6px" }} />
                    <Bone w="40%" h={10} />
                </div>
            ))}
        </section>
        <div className="ex-dash">
            <section className="ex-card ex-dash__full">
                <CardHead />
                <Bone h={180} style={{ borderRadius: 10 }} />
            </section>
            {range(2).map((card) => (
                <section key={card} className="ex-card">
                    <CardHead />
                    {["85%", "60%", "40%", "25%"].map((w) => <MeterRow key={w} width={w} />)}
                </section>
            ))}
            {range(2).map((card) => (
                <section key={card} className="ex-card">
                    <CardHead />
                    {range(5).map((i) => (
                        <div key={i} className="ex-skel__row ex-skel__list-row">
                            <Bone w={`${55 - i * 6}%`} h={12} />
                            <Bone w={64} h={12} />
                        </div>
                    ))}
                </section>
            ))}
        </div>
    </Busy>
);

/** Table rows; the first column gets a category-style icon when `icon` is set. */
export const TableSkeleton = ({ rows = 6, cols, icon = false }: { rows?: number; cols: string[]; icon?: boolean }) => (
    <Busy label="Loading…" className="ex-table-wrap">
        <table className="ex-table ex-table--static ex-skel__table">
            <tbody>
                {range(rows).map((r) => (
                    <tr key={r}>
                        {cols.map((w, c) => (
                            <td key={c}>
                                {icon && c === 0 ? (
                                    <span className="ex-skel__inline">
                                        <Bone w={28} h={28} round />
                                        <Bone w={w} h={12} />
                                    </span>
                                ) : (
                                    <Bone w={w} h={12} />
                                )}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </Busy>
);

/** Rows of the Accounts list: icon, name, meta line. */
export const AccountListSkeleton = () => (
    <Busy label="Loading accounts…">
        <ul className="ex-account-list">
            {range(3).map((i) => (
                <li key={i} className="ex-account">
                    <Bone w={36} h={36} round />
                    <div className="ex-account__main">
                        <Bone w={`${60 - i * 10}%`} h={13} />
                        <Bone w="75%" h={10} style={{ marginTop: 6 }} />
                    </div>
                </li>
            ))}
        </ul>
    </Busy>
);

/** Transaction details: the summary card on the left, the details list on the right. */
export const DetailsSkeleton = () => (
    <Busy label="Loading transaction…" className="ex-details">
        <section className="ex-card ex-hero">
            <Bone w={48} h={48} round />
            <Bone w="60%" h={16} />
            <Bone w={70} h={20} style={{ borderRadius: 999 }} />
            <Bone w="50%" h={28} />
            <Bone w="35%" h={11} />
        </section>
        <section className="ex-card">
            <Bone w="25%" h={16} style={{ marginBottom: 18 }} />
            {range(7).map((i) => (
                <div key={i} className="ex-skel__row ex-skel__list-row">
                    <Bone w="22%" h={11} />
                    <Bone w={`${50 - (i % 3) * 10}%`} h={12} />
                </div>
            ))}
        </section>
    </Busy>
);

/** Add/edit transaction form: type toggle, then label + input pairs. */
export const FormSkeleton = () => (
    <Busy label="Loading form…" className="ex-card">
        <Bone w={260} h={36} style={{ borderRadius: 10, marginBottom: 20 }} />
        {range(5).map((i) => (
            <div key={i} className="ex-skel__field">
                <Bone w={110} h={11} />
                <Bone h={38} style={{ borderRadius: 8 }} />
            </div>
        ))}
    </Busy>
);
