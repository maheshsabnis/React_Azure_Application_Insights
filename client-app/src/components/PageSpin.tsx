/**
 * CLSPageSpinComponent Component
 *
 * A full-page centered loading spinner used as a placeholder
 * while dashboard pages are loading data from the API.
 */

import { Spin } from 'antd';

/**
 * Renders a large, centered Ant Design spinner.
 * Used as the loading state for page-level data fetches.
 */
export default function CLSPageSpinComponent() {
  return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
}
