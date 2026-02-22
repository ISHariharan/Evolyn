import { useEffect } from "react";
import "./StrideDashBoard.scss";

const StrideDashBoard = () => {
  const value = 70;
  const color = "#3B82F6";
  const safeValue = Math.min(100, Math.max(0, value));
  const percentage  = 72;

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
            WontDo : "2",
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

  const findDifferentStrideTemplates = (workspaceId : any, strides: any) => {
    if(workspaceId === undefined) return;
    const templates = new Set<Array<any>>();
    strides?.forEach((stride : any) => {
      templates.add(stride.strideTemplate.replace(/ /g, ''));
    })
    return {
      workspaceId,
      templates: templates,
    };
  }

  const groupWorkspaceStride = (strideTableContent : any) => {
    const templates: any = [];
    strideTableContent.forEach((content : any) => {
      if(content.tableHeader) return;
      let template = findDifferentStrideTemplates(content.workspaceId, content.strides);
      templates.push(template);
    });
  }

  useEffect(() => {
    groupWorkspaceStride(strideTableContent);
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
      {strideTableContent.map((item, index) => (
          <div>
            <div className="stridedashboard-table-header">
              {item.tableHeader && (
                <div className="stridedashboard-system-signals-header">{item.tableHeader}</div>
              )}
              {item.workspaceTitle && (
                <div className="stridebashboard-workspace-header-container">
                  <div className="stridedashboard-workspace-header">
                    <div className={`${item.workspaceIcon}`}></div>
                    <div>{item.workspaceTitle}</div>
                  </div>
                  <div className="stridedashboard-workspace-stride-count">2 Strides</div>
                  <div className="stridedashboard-workspace-stride-items">18 items</div>
                  <div className="stridedashboard-workspace-percentage">{percentage}%</div>
                  {percentage > 60 ? (
                    <div className="stridedashboard-workspace-status-icon bx bx-check"></div>
                  ) : (
                    <div className="stridedashboard-workspace-status-icon bx bx-x"></div>
                  )}
                </div>
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
              {item.workspaceTitle && (
                <div>New</div>
              )}
            </div>
          </div>
      ))}
    </div>
  );
};

export default StrideDashBoard;
