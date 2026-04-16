UPDATE storage.buckets 
SET file_size_limit = 524288000,
    allowed_mime_types = ARRAY['video/mp4','video/quicktime','video/webm','video/x-m4v','video/x-matroska','video/3gpp','video/mpeg']
WHERE id = 'projeto-reels';