import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, MapPin, Award, Calendar } from "lucide-react";
import { motion } from "framer-motion";

const DoctorCard = ({ doctor }) => {
  // Calculate full stars, partial stars for ratings display
  const fullStars = Math.floor(doctor.ratings);
  const hasHalfStar = doctor.ratings % 1 >= 0.5;

  // Get the review count safely
  const reviewCount = Array.isArray(doctor.reviews) 
    ? doctor.reviews.length 
    : (typeof doctor.reviews === 'number' ? doctor.reviews : 0);

  // Determine availability badge color
  const getAvailabilityColor = (availability) => {
    if (availability === "Today")
      return "bg-green-100 text-green-800 border-green-200";
    if (availability === "Tomorrow")
      return "bg-blue-100 text-blue-800 border-blue-200";
    return "bg-amber-100 text-amber-800 border-amber-200";
  };

  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.3 }}>
      <Link href={`/doctors/${doctor._id || doctor.id}`} passHref>
        <Card className="overflow-hidden h-full bg-white border border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 rounded-xl">
          <CardContent className="p-0">
            <div className="flex flex-col h-full">
              {/* Image section with gradient overlay and specialty badge */}
              <div className="relative h-56 w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                <Image
                  src={doctor.image}
                  alt={doctor.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority
                  className="object-cover top-0 transition-transform duration-700 hover:scale-110"
                />

                <div className="absolute top-4 left-4 z-20">
                  <Badge
                    variant="secondary"
                    className="text-xs px-2 py-1 bg-white/90 text-gray-800 backdrop-blur-sm"
                  >
                    {doctor.specialty}
                  </Badge>
                </div>

                <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-center">
                  <Badge
                    className={`px-3 py-1 text-xs font-medium ${getAvailabilityColor(
                      doctor.nextAvailable
                    )}`}
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    {doctor.nextAvailable}
                  </Badge>

                  <Badge
                    variant="outline"
                    className="px-3 py-1 text-xs font-medium bg-white/90 text-gray-800"
                  >
                    ${doctor.price} / visit
                  </Badge>
                </div>
              </div>

              {/* Content section */}
              <div className="p-5 flex flex-col flex-1">
                <div className="space-y-4">
                  {/* Name and ratings */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1 line-clamp-1">
                      {doctor.name}
                    </h3>

                    <div className="flex items-center">
                      <div className="flex items-center text-yellow-500 mr-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < fullStars
                                ? "fill-yellow-400 text-yellow-400"
                                : i === fullStars && hasHalfStar
                                ? "fill-gradient-lr text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-gray-600 text-sm font-medium">
                        {doctor.ratings} ({reviewCount})
                      </span>
                    </div>
                  </div>

                  {/* Hospital and experience */}
                  <div className="space-y-1.5">
                    <div className="flex items-center text-gray-600">
                      <Award className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="text-sm line-clamp-1">
                        {doctor.qualification}
                      </span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="text-sm line-clamp-1">
                        {doctor.hospital}
                      </span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="text-sm line-clamp-1">
                        {doctor.experience} experience
                      </span>
                    </div>
                  </div>

                  {/* Bio summary */}
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {doctor.bio}
                  </p>
                </div>

                {/* Call to action */}
                <div className="mt-auto pt-4">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-white transition-all duration-300"
                  >
                    <div className="relative z-10 flex items-center justify-center">
                      <span className="font-medium">View Profile & Book</span>
                      <svg
                        className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </div>
                    <div className="absolute inset-0 z-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </motion.div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

export default DoctorCard;
