import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "./ui/card";

export function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Card className="group h-full p-6">
        <span className="mb-5 inline-grid h-11 w-11 place-items-center rounded-md border border-[#e8e6e1] bg-[#fbfbfa] text-[#161513] transition-colors duration-300 group-hover:border-[#0c0b0a] group-hover:bg-[#0c0b0a] group-hover:text-white">
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.6} />
        </span>
        <h3 className="mb-2 text-lg font-semibold tracking-tight text-[#161513]">{title}</h3>
        <p className="text-sm leading-relaxed text-[#6b665d]">{description}</p>
      </Card>
    </motion.div>
  );
}
