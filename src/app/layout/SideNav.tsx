import { panels } from './panels';
import type { PanelId } from '../../shared/types';

interface SideNavProps {
  activePanel: PanelId;
  setActivePanel: (panel: PanelId) => void;
}

export function SideNav({ activePanel, setActivePanel }: SideNavProps) {
  return (
    <nav className="side-nav" aria-label="QA panels">
      {panels.map((panel) => {
        const Icon = panel.icon;

        return (
          <button
            key={panel.id}
            className={activePanel === panel.id ? 'is-active' : ''}
            type="button"
            onClick={() => setActivePanel(panel.id)}
          >
            <Icon size={18} />
            <span>
              <strong>{panel.label}</strong>
              <small>{panel.description}</small>
            </span>
          </button>
        );
      })}
    </nav>
  );
}
