import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const updateSearchCount = async (searchTerm, movie) => {
  try {
    // 1. Check if the search term already exists
    const { data: existing, error: fetchError } = await supabase
      .from("movie_searches")
      .select("*")
      .eq("searchTerm", searchTerm)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // code PGRST116 means "no rows found"
      throw fetchError;
    }

    // 2. If it exists → update count
    if (existing) {
      const { data, error } = await supabase
        .from("movie_searches")
        .update({ count: existing.count + 1 })
        .eq("id", existing.id);

      if (error) throw error;
      console.log("Updated count:", data);
      return data;
    }

    // 3. If not exists → insert new record
    const { data, error } = await supabase.from("movie_searches").insert([
      {
        searchTerm,
        count: 1,
        movie_id: movie.id,
        poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      },
    ]);

    if (error) throw error;
    console.log("Inserted new movie:", data);
    return data;
  } catch (err) {
    console.error("updateSearchCount failed:", err.message || err);
  }
};

export const getTrendingMovies = async () => {
  try {
    const { data, error } = await supabase
      .from("movie_searches") 
      .select("*")
      .order("count", { ascending: false }) 
      .limit(5); 

    if (error) throw error;

    return data; 
  } catch (err) {
    console.error("getTrendingMovies failed:", err.message || err);
    return [];
  }
};

