/**
 * CLSStatusTagComponent Component
 *
 * Renders a green "Success" or red "Failed" tag based on a boolean value.
 * Used in trace and request tables to visually indicate operation outcomes.
 * Labels are customizable via props.
 */

import { Tag } from 'antd';

/** Props for the CLSStatusTagComponent component. */
interface CLSStatusTagComponentProps {
  /** Whether the operation was successful. */
  success: boolean;
  /** Label for successful operations. Defaults to "Success". */
  successLabel?: string;
  /** Label for failed operations. Defaults to "Failed". */
  failLabel?: string;
}

/**
 * Displays a colored tag indicating success (green) or failure (red).
 */
export default function CLSStatusTagComponent({ success, successLabel = 'Success', failLabel = 'Failed' }: CLSStatusTagComponentProps) {
  return <Tag color={success ? 'green' : 'red'}>{success ? successLabel : failLabel}</Tag>;
}
