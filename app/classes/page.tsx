'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Calendar, Clock, Users } from 'lucide-react';
import { Navigation } from '@/components/shared/navigation';

export default function ClassesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {/* Hero Section */}
      <section className="bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-6">Exercise Classes</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Discover our range of exercise classes designed specifically for adults aged 50+. From gentle yoga to strength training, find the perfect class for your fitness journey.
          </p>
        </div>
      </section>

      {/* Search Filters */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="grid gap-4 md:grid-cols-5">
            <Input placeholder="Search classes..." className="md:col-span-2" />
            <Input type="text" placeholder="Location" />
            <Input type="date" placeholder="Date" />
            <Button className="w-full">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </div>
      </section>

      {/* Class List */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-6">
            {[
              {
                title: "Gentle Yoga",
                description: "A gentle approach to yoga suitable for all levels",
                location: "Studio A, Fitness Center",
                time: "10:00 AM",
                duration: "60 mins",
                instructor: "Sarah Johnson",
                capacity: "15 spots available",
                image: "https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg"
              },
              {
                title: "Chair Fitness",
                description: "Low-impact exercises using a chair for support",
                location: "Community Hall",
                time: "2:00 PM",
                duration: "45 mins",
                instructor: "Michael Chen",
                capacity: "12 spots available",
                image: "https://images.pexels.com/photos/7991157/pexels-photo-7991157.jpeg"
              },
              {
                title: "Strength & Balance",
                description: "Build strength and improve balance",
                location: "Studio B, Fitness Center",
                time: "11:00 AM",
                duration: "60 mins",
                instructor: "Emma Williams",
                capacity: "10 spots available",
                image: "https://images.pexels.com/photos/7991714/pexels-photo-7991714.jpeg"
              }
            ].map((cls, i) => (
              <div key={i} className="rounded-xl border bg-card overflow-hidden">
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="aspect-video md:aspect-square relative">
                    <img
                      src={cls.image}
                      alt={cls.title}
                      className="object-cover absolute inset-0 h-full w-full"
                    />
                  </div>
                  <div className="p-6 md:col-span-3">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-bold mb-2">{cls.title}</h2>
                        <p className="text-muted-foreground mb-4">{cls.description}</p>
                      </div>
                      <Button>Book Now</Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{cls.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{cls.time} ({cls.duration})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{cls.capacity}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Every Monday</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our community of active adults and experience the benefits of regular exercise in a supportive environment.
          </p>
          <Button size="lg">Book Your First Class</Button>
        </div>
      </section>
    </div>
  );
}