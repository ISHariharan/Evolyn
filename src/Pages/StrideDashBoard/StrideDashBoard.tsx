import { useEffect, useState } from "react";
import "./StrideDashBoard.scss";

const StrideDashBoard = () => {
  const value = 70;
  const color = "#3B82F6";
  const safeValue = Math.min(100, Math.max(0, value));
  const percentage  = 72;
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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
  ];


  // Type of content expected from stride dashboard table
  const strideTableContent = [
    {
      tableHeader : "System Signals",
      tableContent : [
        {
          contentIcon : "bx bx-error-alt",
          contentHeader : "Stalled Flow",
          contentDescription : "2 strides have items stuck In Progress for over 10 days",
        },
        {
          contentIcon : "bx bx-cut",
          contentHeader : "High Pruning",
          contentDescription : "Won't Do increased by 40% this week",
        },
        {
          contentIcon : "bx bx-clipboard",
          contentHeader : "Positive Momentum",
          contentDescription : "Completion rate improved after Todo load dropped",
        }
      ],
    },
    {
      workspaceTitle : "DeepWorks",
      workspaceId : "d3b6cbf3-cca6-45d7-a245-f3c194f0176e",
      workspaceIcon : "bx bx-folder",
      strides : [
        {
          strideId: "1",
          strideName : "Sprint Planning",
          strideTemplate : "ToDo,InProgress,Won't Do,Done",
          strideDetails : {
            ToDo : "7",
            InProgress : "3",
            WontDo : "2",
            Done: "10",
          },
          strideAvgCycle : "2.8 days",
          oldestItem : "9 days",
        },
        {
          strideId: "2",
          strideName : "Research Tasks",
          strideTemplate : "ToDo,InProgress,Won't Do,Done",
          strideDetails : {
            ToDo : "9",
            InProgress : "5",
            WontDo : "4",
            Done: "3",
          },
          strideAvgCycle : "1.7 days",
          oldestItem : "10 days",
        },
      ]
    },
    {
      workspaceTitle : "Fitness",
      workspaceId : "f9b595cd-0fa6-4045-aaae-fefe54f73238",
      workspaceIcon : "bx bx-pin",
      strides : [
        {
          strideId: "3",
          strideName : "Sprint Planning",
          strideTemplate : "ToDo,InProgress,Done",
          strideDetails : {
            ToDo : "7",
            InProgress : "3",
            Done: "10",
          },
          strideAvgCycle : "2.8 days",
          oldestItem : "9 days",
        },
        {
          strideId: "4",
          strideName : "Research Tasks",
          strideTemplate : "ToDo,InProgress,Won't Do,Done",
          strideDetails : {
            ToDo : "9",
            InProgress : "5",
            WontDo : "4",
            Done: "3",
          },
          strideAvgCycle : "1.7 days",
          oldestItem : "10 days",
        },
      ]
    }
  ];

  const getAllStatuses = (strides: any[]) => {
    const statusOrder: string[] = [];
    const seen = new Set<string>();

    strides.forEach((stride) => {
      if (stride.strideDetails) {
        Object.keys(stride.strideDetails).forEach((status) => {
          if (!seen.has(status)) {
            seen.add(status);
            statusOrder.push(status);
          }
        });
      }
    });

    return statusOrder;
  };

  const getWorkspaceTemplateGroups = (strides: any[]) => {
    const groups = new Map<string, any>();

    strides.forEach((stride) => {
      const key = stride.strideTemplate?.replace(/\s+/g, "") || "unknown";
      if (!groups.has(key)) {
        groups.set(key, {
          originalTemplate: stride.strideTemplate,
          strides: [],
          totalDone: 0,
          totalItems: 0,
          maxOldestDays: 0,
          maxOldestStr: "0 days",
          cycleTimes: [],
          statusTotals: {} as Record<string, number>,
        });
      }

      const g = groups.get(key)!;
      g.strides.push(stride);

      const details = stride.strideDetails || {};
      const done = Number(details.Done || 0);
      const total = Object.values(details).reduce((sum: number, v: any) => sum + Number(v || 0), 0);

      g.totalDone += done;
      g.totalItems += total;

      const oldestDays = parseFloat(stride.oldestItem) || 0;
      if (oldestDays > g.maxOldestDays) {
        g.maxOldestDays = oldestDays;
        g.maxOldestStr = stride.oldestItem;
      }

      const cycle = parseFloat(stride.strideAvgCycle) || 0;
      g.cycleTimes.push(cycle);
    });

    return Array.from(groups.values()).map((group) => {
      const progress =
        group.totalItems > 0
          ? Math.round((group.totalDone / group.totalItems) * 100)
          : 0;

      const avgCycle =
        group.cycleTimes.length > 0
          ? (group.cycleTimes.reduce((a :any, b:any) => a + b, 0) / group.cycleTimes.length).toFixed(1) + " days"
          : "—";

      return {
        ...group,
        progress,
        avgCycle,
        oldestItem: group.maxOldestStr,
        isOldestWarning: group.maxOldestDays > 9,
        statuses: getAllStatuses(group.strides),
      };
    });
  };

  const nestByWorkspace = (groupedData: any[]) => {
    const workspaceMap = new Map<string, { workspaceId: string; templates: any[] }>();

    groupedData.forEach(item => {
      const wid = item.workspaceId;
      if (!workspaceMap.has(wid)) {
        workspaceMap.set(wid, { workspaceId: wid, templates: [] });
      }
      workspaceMap.get(wid)!.templates.push({
        Template: item.Template,
        strideId: item.strideId
      });
    });

    return Array.from(workspaceMap.values());
  };

  const groupStridesByWorkspaceAndTemplate = (strideTableContent: any[]) => {
    const result: Array<{
      workspaceId: string;
      Template: string;
      strideId: string[];
    }> = [];

    strideTableContent.forEach((item) => {
      if (!item.workspaceId || !item.strides?.length) return;
      const templateToStrideIds = new Map<string, string[]>();

      item.strides.forEach((stride: any) => {
        if (!stride?.strideId || !stride?.strideTemplate) return;

        
        const templateKey = stride.strideTemplate.replace(/\s+/g, '');

        if (!templateToStrideIds.has(templateKey)) {
          templateToStrideIds.set(templateKey, []);
        }

        templateToStrideIds.get(templateKey)!.push(stride.strideId);
      });
      templateToStrideIds.forEach((strideIds, template) => {
        result.push({
          workspaceId: item.workspaceId,
          Template: template,           
          strideId: strideIds,
        });
      });
    });

    return result;
  };

  useEffect(() => {
    const groupedData = groupStridesByWorkspaceAndTemplate(strideTableContent);
    const nestedWorkspace = nestByWorkspace(groupedData);
    console.log("Grouped Data and Nested Workspace : ", groupedData, nestedWorkspace);
  }, []);

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

          {/* New Filter Button + Side Panel */}
          <button
            className="stride-dashboard-filter-button"
            onClick={() => setIsFilterOpen(true)}
            aria-label="Open filter options"
          >
            <i className="bx bx-filter-alt"></i>
            <span>Filter</span>
          </button>
          {/* <div className="stride-dashboard-filter-dropdown">
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
          </div> */}
          {isFilterOpen && (
            <>
              {/* Backdrop */}
              <div
                className="stride-dashboard-filter-backdrop"
                onClick={() => setIsFilterOpen(false)}
              />

              {/* Sliding Panel */}
              <div className={`stride-dashboard-filter-panel ${isFilterOpen ? "open" : ""}`}>
                <div className="filter-panel-header">
                  <h3>Filters</h3>
                  <button
                    className="filter-panel-close"
                    onClick={() => setIsFilterOpen(false)}
                    aria-label="Close filter panel"
                  >
                    <i className="bx bx-x"></i>
                  </button>
                </div>

                <div className="filter-panel-content">
                  <div className="filter-option">
                    <label>Time Period</label>
                    <select defaultValue="7days">
                      <option value="7days">Last 7 Days</option>
                      <option value="30days">Last Month</option>
                      <option value="180days">Last 6 Months</option>
                      <option value="365days">Last Year</option>
                    </select>
                  </div>

                  {/* Add more filter dropdowns here as needed */}
                  {/* Example: */}
                  {/* <div className="filter-option">
                    <label>Workspace</label>
                    <select>
                      <option>All Workspaces</option>
                      <option>DeepWorks</option>
                      <option>Fitness</option>
                    </select>
                  </div> */}

                  <div className="filter-actions">
                    <button className="btn-reset" onClick={() => setIsFilterOpen(false)}>
                      Reset
                    </button>
                    <button className="btn-apply" onClick={() => setIsFilterOpen(false)}>
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
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
      {strideTableContent.map((item, index) => (
          <div>
            <div className="stridedashboard-table-header">
              {item.tableHeader && (
                <div className="stridedashboard-system-signals-header">{item.tableHeader}</div>
              )}
            </div>
            <div className="stridedashboard-table-content">
              {item.tableHeader && (
                <div className="stridedashboard-system-signals-container">
                  {item.tableContent.map((row, index) => (
                    <div className="stridedashboard-system-signals-board" key={index}>
                      <div className={`${row.contentIcon} system-signals-icon`}></div>
                      <div className="stridedashboard-system-signals-content">
                        <div className="stridedashboard-system-signals-content-header">{row.contentHeader}</div>
                        <div className="stridedashboard-system-signals-content-description">{row.contentDescription}</div>
                      </div>
                    </div>  
                  ))}
                </div>
              )}
              {item.workspaceTitle && item.strides && (
                <>
                  {/* Workspace main header */}
                  <div className="stridedashboard-table-header">
                    <div className="stridebashboard-workspace-header-container">
                      <div className="stridedashboard-workspace-header">
                        <i className={item.workspaceIcon}></i>
                        <div>{item.workspaceTitle}</div>
                      </div>

                      {(() => {
                        const strideCount = item.strides.length;
                        const totalItems = item.strides.reduce((sum, s) => {
                          return sum + Object.values(s.strideDetails || {}).reduce((a, b) => a + Number(b || 0), 0);
                        }, 0);
                        const doneItems = item.strides.reduce((sum, s) => sum + Number(s.strideDetails?.Done || 0), 0);
                        const completion = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

                        return (
                          <>
                            <div className="stridedashboard-workspace-stride-count">
                              {strideCount} strides
                            </div>
                            <div className="stridedashboard-workspace-stride-items">
                              {totalItems} items
                            </div>
                            <div className="stridedashboard-workspace-percentage">
                              {completion}%
                            </div>
                            {completion >= 65 ? (
                              <i className="stridedashboard-workspace-status-icon bx bx-check"></i>
                            ) : (
                              <i className="stridedashboard-workspace-status-icon bx bx-x"></i>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Template items + stride rows */}
                  <div className="stridedashboard-table-content">
                    {getWorkspaceTemplateGroups(item.strides).map((group, groupIdx) => (
                      <div className="template-group" key={groupIdx}>
                        {/* Template summary header */}
                        <div className="stridedashboard-template-header">
                          <div className="template-metrics">
                            <div className="template-progress-container">
                              <div
                                className="template-progress-fill"
                                style={{
                                  width: `${group.progress}%`,
                                  backgroundColor:
                                    group.progress >= 70 ? "#10B981" :
                                    group.progress >= 40 ? "#F59E0B" :
                                    "#EF4444",
                                }}
                              />
                            </div>
                            <span className="template-stat">{group.progress}%</span>
                            <span className="template-stat">Avg: {group.avgCycle}</span>
                            <span
                              className={`template-stat oldest ${group.isOldestWarning ? "warning" : ""}`}
                            >
                              Oldest: {group.oldestItem}
                            </span>
                          </div>
                        </div>

                        <div className="stride-table">
                          <div className="stride-table-header">
                            <div>Stride</div>
                            <div>Progress</div>

                            {group.statuses.map((status : any) => (
                              <div key={status} className="status-header">
                                {status}
                                {/* <small>{group.statusTotals[status] || 0}</small> */}
                              </div>
                            ))}

                            <div>Avg Cycle</div>
                            <div>Oldest Item</div>
                          </div>

                          {group.strides.map((stride : any) => {
                            const details = stride.strideDetails || {};
                            const inProg = Number(details.InProgress || 0);
                            const done = Number(details.Done || 0);
                            const wontDo = Number(details.WontDo || details["Won't Do"] || 0);
                            const todo = Number(details.ToDo || 0);
                            const total = inProg + done + wontDo + todo;
                            const progPercent = total > 0 ? Math.round((done / total) * 100) : 0;

                            return (
                              <div className="stride-row" key={stride.strideId}>
                                <div className="stride-name">
                                  <i className="bx bx-task"></i>
                                  {stride.strideName}
                                </div>
                                <div className="progress-cell">
                                  <div className="mini-progress">
                                    <div style={{ width: `${progPercent}%` }} />
                                  </div>
                                </div>
                                {group.statuses.map((status : any) => (
                                  <div key={status}>{Number(details[status] || 0)}</div>
                                ))}
                                <div>{stride.strideAvgCycle}</div>
                                <div className={parseFloat(stride.oldestItem) > 9 ? "oldest-warning" : ""}>
                                  {stride.oldestItem}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
      ))}
    </div>
  );
};

export default StrideDashBoard;
