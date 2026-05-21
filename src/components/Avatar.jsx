const COLORS = {
  g: { bg:'var(--gs)', color:'var(--green)' },
  b: { bg:'var(--bs)', color:'var(--blue)'  },
  o: { bg:'var(--golds)', color:'var(--gold)'  },
  r: { bg:'var(--rs)', color:'var(--red)'   },
  p: { bg:'var(--ps)', color:'var(--purple)' },
}
export default function Avatar({ text, color = 'g', size = 36 }) {
  const c = COLORS[color] || COLORS.g
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize: size * 0.28, fontWeight:800, flexShrink:0,
      background:c.bg, color:c.color,
    }}>
      {text}
    </div>
  )
}
