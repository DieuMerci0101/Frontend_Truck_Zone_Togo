"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Headphones,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  phone: z.string().optional(),
  subject: z.string().min(3, "Le sujet doit contenir au moins 3 caractères"),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères"),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactForm) => {
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Votre message a été envoyé avec succès !");
    reset();
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-10 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">Contactez-nous</h1>
            <p className="text-blue-200 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">
              Nous sommes là pour répondre à vos questions
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="p-5 sm:p-6 lg:p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-5 sm:mb-6">
                    Envoyez-nous un message
                  </h2>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                      <Input
                        label="Nom complet"
                        icon={Mail}
                        placeholder="Votre nom"
                        error={errors.name?.message}
                        {...register("name")}
                      />
                      <Input
                        label="Email"
                        type="email"
                        icon={Mail}
                        placeholder="votre@email.com"
                        error={errors.email?.message}
                        {...register("email")}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                      <Input
                        label="Téléphone (optionnel)"
                        type="tel"
                        icon={Phone}
                        placeholder="+228 90 12 34 56"
                        {...register("phone")}
                      />
                      <Input
                        label="Sujet"
                        icon={MessageSquare}
                        placeholder="Sujet du message"
                        error={errors.subject?.message}
                        {...register("subject")}
                      />
                    </div>
                    <Textarea
                      label="Message"
                      placeholder="Votre message..."
                      rows={5}
                      error={errors.message?.message}
                      {...register("message")}
                    />
                    <Button type="submit" loading={isSubmitting} size="lg" className="w-full sm:w-auto min-h-[44px]">
                      <Send className="h-4 w-4 mr-2" />
                      Envoyer le message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="lg:col-span-2 space-y-5 sm:space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent className="p-5 sm:p-6 space-y-5 sm:space-y-6">
                  <h3 className="text-lg font-bold text-gray-900">
                    Informations de contact
                  </h3>

                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-blue-700" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Adresse</p>
                      <p className="text-sm text-gray-500">
                        Lomé, Togo
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="h-5 w-5 text-blue-700" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Téléphone</p>
                      <p className="text-sm text-gray-500">+228 90 00 00 00</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="h-5 w-5 text-blue-700" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-sm text-gray-500 break-all">
                        contact@togotruckconnect.com
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="h-5 w-5 text-blue-700" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Horaires</p>
                      <p className="text-sm text-gray-500">
                        Lun - Ven: 8h00 - 18h00
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Headphones className="h-6 w-6 text-blue-700" />
                    <h3 className="text-lg font-bold text-gray-900">
                      Support rapide
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    Besoin d&apos;aide urgente ? Notre équipe est disponible
                    pour vous assister.
                  </p>
                  <Button variant="outline" className="w-full min-h-[44px]" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    Appelez-nous
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <Card>
              <CardContent className="p-5 sm:p-6">
                <div className="bg-gray-100 rounded-xl h-40 sm:h-48 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <MapPin className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Carte de localisation</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
