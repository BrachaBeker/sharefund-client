interface AvatarProps {
    name: string,
    className?: string
}

const Avatar = ({ name, className = "size-9 bg-brand-50 text-sm text-brand-700" }: AvatarProps) => (
    <span className={`grid shrink-0 place-items-center rounded-full font-semibold ${className}`} aria-hidden="true">
        {name.charAt(0)}
    </span>
)

export default Avatar
