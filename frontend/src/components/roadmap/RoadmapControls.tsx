import { useState } from 'react';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { MilestoneStatus } from '../../types/plan';

export type ViewMode = 'tree' | 'timeline' | 'kanban';
export type SortBy = 'dueDate' | 'status' | 'title' | 'createdAt';
export type GroupBy = 'none' | 'status' | 'month';

export interface FilterOptions {
  statuses: MilestoneStatus[];
  searchQuery: string;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

interface RoadmapControlsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortBy: SortBy;
  onSortByChange: (sort: SortBy) => void;
  groupBy: GroupBy;
  onGroupByChange: (group: GroupBy) => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  totalMilestones: number;
  filteredCount: number;
}

export const RoadmapControls: React.FC<RoadmapControlsProps> = ({
  viewMode,
  onViewModeChange,
  sortBy,
  onSortByChange,
  groupBy,
  onGroupByChange,
  filters,
  onFiltersChange,
  totalMilestones,
  filteredCount
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showGroupMenu, setShowGroupMenu] = useState(false);

  const statusOptions: MilestoneStatus[] = [
    'NOT_STARTED',
    'IN_PROGRESS', 
    'COMPLETED',
    'AT_RISK',
    'DELAYED'
  ];

  const statusLabels: Record<MilestoneStatus, string> = {
    NOT_STARTED: 'Not Started',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    AT_RISK: 'At Risk',
    DELAYED: 'Delayed'
  };

  const handleStatusToggle = (status: MilestoneStatus) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter(s => s !== status)
      : [...filters.statuses, status];
    
    onFiltersChange({
      ...filters,
      statuses: newStatuses
    });
  };

  const handleSearchChange = (query: string) => {
    onFiltersChange({
      ...filters,
      searchQuery: query
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      statuses: [],
      searchQuery: '',
      dateRange: { start: null, end: null }
    });
  };

  const activeFilterCount = 
    filters.statuses.length + 
    (filters.searchQuery ? 1 : 0) +
    (filters.dateRange.start || filters.dateRange.end ? 1 : 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 space-y-4">
      {/* Top Row: View Mode & Actions */}
      <div className="flex items-center justify-between gap-4">
        {/* View Mode Switcher */}
        <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-900 rounded-lg">
          <button
            onClick={() => onViewModeChange('tree')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              viewMode === 'tree'
                ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Tree
          </button>
          <button
            onClick={() => onViewModeChange('timeline')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              viewMode === 'timeline'
                ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Timeline
          </button>
          <button
            onClick={() => onViewModeChange('kanban')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              viewMode === 'kanban'
                ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Board
          </button>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Results Count */}
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {filteredCount === totalMilestones ? (
              <>{totalMilestones} milestone{totalMilestones !== 1 ? 's' : ''}</>
            ) : (
              <>{filteredCount} of {totalMilestones} milestone{totalMilestones !== 1 ? 's' : ''}</>
            )}
          </span>

          {/* Sort */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="px-3 py-1.5 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1.5"
            >
              Sort
              <ChevronDown className="h-4 w-4" />
            </button>
            {showSortMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowSortMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                  {[
                    { value: 'dueDate', label: 'Due Date' },
                    { value: 'status', label: 'Status' },
                    { value: 'title', label: 'Title (A-Z)' },
                    { value: 'createdAt', label: 'Created Date' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        onSortByChange(option.value as SortBy);
                        setShowSortMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm ${
                        sortBy === option.value
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Group */}
          <div className="relative">
            <button
              onClick={() => setShowGroupMenu(!showGroupMenu)}
              className="px-3 py-1.5 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1.5"
            >
              Group
              <ChevronDown className="h-4 w-4" />
            </button>
            {showGroupMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowGroupMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                  {[
                    { value: 'none', label: 'None' },
                    { value: 'status', label: 'By Status' },
                    { value: 'month', label: 'By Month' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        onGroupByChange(option.value as GroupBy);
                        setShowGroupMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm ${
                        groupBy === option.value
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg flex items-center gap-1.5 ${
              activeFilterCount > 0
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            🔍 Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-xs">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">�</span>
        <input
          type="text"
          placeholder="Search milestones..."
          value={filters.searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-12 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
        />
        {filters.searchQuery && (
          <button
            onClick={() => handleSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Filters</h3>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Status Filters */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map(status => (
                <button
                  key={status}
                  onClick={() => handleStatusToggle(status)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    filters.statuses.includes(status)
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                  }`}
                >
                  {statusLabels[status]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
