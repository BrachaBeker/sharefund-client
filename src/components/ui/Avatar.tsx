interface AvatarProps {
    name: string,
    className?: string
}

// עיגול עם האות הראשונה של השם: משתמש ב-Header, חבר ברשימה ושולח הודעה
const Avatar = ({ name, className = "size-9 bg-brand-100 text-sm text-brand-700" }: AvatarProps) => (
    <span className={`grid shrink-0 place-items-center rounded-full font-semibold ${className}`} aria-hidden="true">
        {name.charAt(0)}
    </span>
)

export default Avatar
