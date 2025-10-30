

export const DEFAULT_AVATAR = "https://png.pngtree.com/png-clipart/20230927/original/pngtree-man-avatar-image-for-profile-png-image_13001877.png";

export function formatLastSeen(value) {
    if (!value) return '';

    const d = new Date(value);
    if (isNaN(d.getTime())) return '';

    const now = new Date();

    const isSameDay = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
    if (isSameDay) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
    }

    if (d.getFullYear() === now.getFullYear()) {
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }

    return d.toLocaleDateString();
}

export default { DEFAULT_AVATAR, formatLastSeen };
