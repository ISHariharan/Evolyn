import "./StrideDashBoard.scss";

const StrideDashBoard = () => {
  const value = 70;
  const color = "#3B82F6";
  const safeValue = Math.min(100, Math.max(0, value));

  const strideWorkspaceOverview = [
    {
        value : '42',
        metric : "",
        content : "Active Items",
        progress : safeValue,
        progress_color : "#3B82F6",
    },
    {
        value : '68',
        metric : '%',
        content : 'completion (7d)',
        progress: 43,
        progress_color : '#10B981',
    },
    {
        value : '3.2',
        metric : 'days',
        content : 'Avg Cycle Time',
        progress: 67,
        progress_color : '#14B8A6',
    },
    {
        value : '12',
        metric : '%',
        content : 'Pruned Work',
        progress: 12,
        progress_color : '#EF4444',
    },
    {
        value : '6',
        metric : 'Stale Items',
        content : '> 10 days',
        progress: 0,
        progress_color : "",
    }
  ]

  return (
    <div className="stride-dashboard">
      <div className="stride-dashboard-header-container">
        <div className="stride-dashboard-header-left">
          <div className="stride-dashboard-header-left-upper-section">
            <h1>Stride Overview</h1>
          </div>
          <div className="stride-dashboard-header-left-lower-section">
            Execution health across all workspaces
          </div>
        </div>

        <div className="stride-dashboard-header-right">
          <div className="stride-dashboard-filter-dropdown">
            <input
              hidden
              className="stride-dashboard-sr-only"
              id="stride-dashboard-state-dropdown"
              type="checkbox"
            />

            <label
              htmlFor="stride-dashboard-state-dropdown"
              className="stride-dashboard-filter-trigger"
              aria-label="stride dashboard filter dropdown"
            />

            <ul
              className="stride-dashboard-filter-list stride-dashboard-webkit-scrollbar"
              role="list"
            >
              <li className="stride-dashboard-filter-listitem">
                <article className="stride-dashboard-filter-article">Last 7 Days</article>
              </li>

              <li className="stride-dashboard-filter-listitem">
                <article className="stride-dashboard-filter-article">Last Month</article>
              </li>

              <li className="stride-dashboard-filter-listitem">
                <article className="stride-dashboard-filter-article">Last 6 Month</article>
              </li>

              <li className="stride-dashboard-filter-listitem">
                <article className="stride-dashboard-filter-article">Last Year</article>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="stride-dashboard-overview-container">
        {strideWorkspaceOverview.map((item, index) => (
            <div className="stride-dashboard-overview" key={index}>
                <div className="stride-dashboard-overview-upper-container">
                    <div className="stride-dashboard-overview-primary-content">
                        {item.value}
                    </div>
                    <div className="stride-dashboard-overview-secondary-content">
                        {item.metric}
                    </div>
                </div>
                <div className="stride-dashboard-overview-lower-container">
                    <div className="stride-dashboard-overview-lower-primary-content">
                        {item.content}
                    </div>
                    {item.progress > 0 && (
                        <div>
                            <div className="underline-progress">
                                <div
                                    className="underline-progress__fill"
                                        style={{
                                        width: `${item.progress}%`,
                                        backgroundColor: `${item.progress_color}`,
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default StrideDashBoard;
